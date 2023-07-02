/* ******************************************************************************
 * Copyright (c) 2020-2023 Julian Rüth <julian.rueth@fsfe.org>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * *****************************************************************************/

import { ref } from "vue";

import Flatten from "@flatten-js/core";

import Point from "./Point";
import Polygon from "./Polygon";
import Box from "./Box";
import Vector from "./Vector";
import Segment from "./Segment";
import Line from "./Line";

export type Coordinate = number;

// Return the inverse of the invertible matrix A.
// Naturally, this is not very stable numerically. Probably we should solve
// linear equations instead of holding on to an explicit inverse.
export function inverse(A: Flatten.Matrix) {
  const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = [A.a, A.c, A.tx, A.b, A.d, A.ty, 0, 0, 1];
  const adj = [a11*a22 - a21*a12, a10*a22 - a20*a12, a10*a21 - a20*a11, a01*a22 - a21*a02, a00*a22 - a20*a02, a00*a21 - a20*a01, a01*a12 - a11*a02, a00*a12 - a10*a02, a00*a11 - a10*a01];
  const det = a00*adj[0] - a01*adj[1] + a02*adj[2];
  const inv = [adj[0], -adj[3], adj[6], -adj[1], adj[4], -adj[7], adj[2], -adj[5], adj[8]].map(a => a / det);
  const affine = inv.map(a => a / inv[8]);
  console.assert(affine.every((a) => a != null), `Matrix ${A} must be invertible.`);
  return new Flatten.Matrix(affine[0], affine[3], affine[1], affine[4], affine[2], affine[5]);
}

type CoordinateSystemIdentifier = number;

/*
 * A coordinate system.
 * Coordinate systems are stateless (apart from being positive like in
 * Mathematics or negative like in computer screens.)
 * They are just identifiers that are brought in relation to each other by
 * embeddings between systems. But these embeddings are not part of the
 * coordinate system.
 */
export default class CoordinateSystem {
  public constructor(positive: boolean, name: string) {
    this.positive = positive;
    this.name = name;
    this.id = CoordinateSystem.nextId++;

    CoordinateSystemRegistry.register(this);
  }

  public readonly positive: boolean;
  public readonly name: string;
  // This id is used internally to keep track of the relation of this system to
  // other coordinate systems. We do not use the entire coordinate system
  // object for this purpose because Vue.js tends to wrap it Reactive and then
  // we cannot compare systems with === anymore.
  public readonly id: CoordinateSystemIdentifier;

  private static nextId: number = 1;

  // Register (or modify) an embedding from this coordinate system into `into`.
  public embedInto(into: CoordinateSystem, embedding?: Flatten.Matrix): void {
    if (embedding === undefined) {
      embedding = new Flatten.Matrix();
      if (this.positive !== into.positive)
        embedding = new Flatten.Matrix(1, 0, 0, -1);
      return this.embedInto(into, embedding);
    }

    return CoordinateSystemRegistry.registerEmbedding(this, into, embedding);
  }

  // Forget the existing embedding of this coordinate system into `into`.
  public unembedInto(into: CoordinateSystem): void {
    return RegisteredCoordinateSystemEmbeddings.forgetEmbedding(this.id, into.id);
  }

  // Return the argument as an object in this coordinate system.
  public embed(point: Point): Point;
  public embed(vector: Vector): Vector;
  public embed(segment: Segment): Segment;
  public embed(line: Line): Line;
  public embed(polygon: Box | Polygon): Polygon;
  public embed(value: Box | Point | Vector | Segment | Line | Polygon) : Point | Vector | Segment | Line | Polygon {
    if (value instanceof Box) {
      const polygon = new Flatten.Polygon();
      polygon.addFace(value.toPoints().map((point) => this.embed(point).value));
      return new Polygon(this, polygon);
    } else if (value instanceof Point) {
      const transformation = CoordinateSystemRegistry.discoverEmbedding(value.parent, this, true);

      if (transformation == null)
        throw Error("no embedding between these coordinate systems");

      console.assert(transformation.tx != null && transformation.ty != null && transformation.a * transformation.d - transformation.b * transformation.c, "Discovered an embedding that is not invertible.", transformation);

      return new Point(this, value.value.transform(transformation));
    } else if (value instanceof Vector) {
      const point = this.embed(new Point(value.parent, value.x, value.y));
      const origin = this.embed(new Point(value.parent, 0, 0));
      return new Vector(this, point.x - origin.x, point.y - origin.y);
    } else if (value instanceof Segment) {
      return new Segment(this, this.embed(value.start).value, this.embed(value.end).value);
    } else if (value instanceof Line) {
      return new Line(this.embed(value.pt), this.embed(value.norm));
    } else if (value instanceof Polygon) {
      return new Polygon(this, new Flatten.Polygon(([...value.value.faces] as Flatten.Face[]).map((face) => (face.edges as Flatten.Edge[]).map((edge) => this.embed(new Point(value.parent, edge.start)).value))));
    }

    throw Error(`cannot embed this type of object into coordinate system yet`);
  }
}

// Base class for embeddings between coordinate systems.
class AbstractEmbedding {
  public constructor(embedding: Flatten.Matrix) {
    this.embedding = embedding;
  }

  public touch(): void {
    this.touchable.value;
  }

  public invalidate() {
    this.touchable.value++;
  }

  public embedding: Flatten.Matrix;
  private touchable = ref(0);
};

// An explicitly registered embedding that has been created through embedInto.
class RegisteredEmbedding extends AbstractEmbedding {
  public update(embedding: Flatten.Matrix) {
    this.invalidate();
    this.embedding = embedding;
  }
};

// A discovered embedding such as the composition of registered embeddings or
// their inverses.
class DiscoveredEmbedding extends AbstractEmbedding {
};

// A singleton registry of all known coordinate systems.
// CoordinateSystem should only interact with this object and not with the
// other registries.
class CoordinateSystemRegistry {
  // Make a coordinate systems known to the registry (and make sure we clean
  // things up when all references to that coordinate system are gone.)
  public static register(coordinateSystem: CoordinateSystem) {
    this.registry.register(coordinateSystem, coordinateSystem.id);
  }

  // Explicitly register a new embedding or update an existing (registered)
  // embedding between coordinate systems.
  public static registerEmbedding(from: CoordinateSystem, into: CoordinateSystem, embedding: Flatten.Matrix) {
    console.assert(embedding instanceof Flatten.Matrix);

    if (embedding.tx == null || embedding.ty == null || !(embedding.a * embedding.d - embedding.b * embedding.c))
      throw Error(`Embedding matrix is not invertible: ${JSON.stringify(embedding)}`);

    if (RegisteredCoordinateSystemEmbeddings.get(from.id, into.id, false) != null)
      RegisteredCoordinateSystemEmbeddings.updateEmbedding(from.id, into.id, embedding);
    else {
      console.assert(this.discoverEmbedding(from, into, false) == null);

      RegisteredCoordinateSystemEmbeddings.registerEmbedding(from.id, into.id, embedding);
    }
  }

  // Return a transformation between ``from`` and ``into`` or ``null`` if the systems are unrelated.
  // The transformation is constructed by following registered embeddings,
  // their inverses and compositions thereof.
  // When ``reactive`` is set, we touch a Vue reactive variable so that changes
  // to that transformation lead to this code path being reevaluated.
  public static discoverEmbedding(from: CoordinateSystem, into: CoordinateSystem, reactive: boolean): Flatten.Matrix | null {
    if (from.id == into.id)
      return new Flatten.Matrix(1, 0, 0, 1);

    let embedding = RegisteredCoordinateSystemEmbeddings.get(from.id, into.id, reactive);
    if (embedding != null)
      return embedding;

    embedding = RegisteredCoordinateSystemEmbeddings.get(into.id, from.id, reactive);

    if (embedding != null)
      return inverse(embedding);

    return DiscoveredCoordinateSystemEmbeddings.get(from.id, into.id, reactive);
  }

  // When all references to a coordinate system are gone, this cleanup function
  // gets (eventually) called.
  private static registry = new FinalizationRegistry((id: CoordinateSystemIdentifier) => {
    RegisteredCoordinateSystemEmbeddings.forget(id);
    DiscoveredCoordinateSystemEmbeddings.forget(id);
    CoordinateSystemReachability.forget(id);
  });
};

// A singleton registry of all explicitly registered embeddings between
// coordinate systems.
class RegisteredCoordinateSystemEmbeddings {
  // Return the registered transformation ``from`` to ``into`` or ``null`` if
  // there is no embedding registered between the two systems.
  // When ``reactive`` is set, we touch a Vue reactive variable so that changes
  // to that transformation lead to this code path being reevaluated.
  // Note: Currently, reactivity is not supported when the result is "null".
  public static get(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier, reactive: boolean) {
    if (!this.embeddings.has(from))
      return null;

    if (!this.embeddings.get(from)!.has(into))
      return null;

    const embedding = this.embeddings.get(from)!.get(into)!;

    if (reactive)
      embedding.touch();

    return embedding.embedding;
  }

  // Register a new embedding between ``from`` and ``into``.
  public static registerEmbedding(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier, embedding: Flatten.Matrix) {
    CoordinateSystemReachability.registerEmbedding(from, into);

    if (!this.embeddings.has(from))
      this.embeddings.set(from, new Map());

    console.assert(!this.embeddings.get(from)!.has(into));

    this.embeddings.get(from)!.set(into, new RegisteredEmbedding(embedding));
  }

  // Drop the registered embedding between ``from`` and ``into``.
  public static forgetEmbedding(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier) {
    CoordinateSystemReachability.forgetEmbedding(from, into);
    this.embeddings.get(from)!.delete(into);
    DiscoveredCoordinateSystemEmbeddings.invalidateDependentEmbeddings(from, into);
  }

  // Update the existing embedding between ``from`` and ``into``.
  // This takes care of updating all the discovered embeddings that depend upon
  // this embedding.
  public static updateEmbedding(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier, embedding: Flatten.Matrix) {
    const previous = this.embeddings.get(from)!.get(into)!;
    if (previous.embedding.equalTo(embedding))
      return;

    previous.update(embedding);
    DiscoveredCoordinateSystemEmbeddings.invalidateDependentEmbeddings(from, into);
  }

  // Return all the coordinate system identifiers that have an embedding
  // registered from ``from`` or into ``from``.
  public static getNeighbors(from: CoordinateSystemIdentifier) {
    const neighbors = []
    for (const entry of CoordinateSystemReachability.getComponent(from)) {
      if (this.embeddings.get(from)?.get(entry))
        neighbors.push([from, entry]);
      if (this.embeddings.get(entry)?.get(from))
        neighbors.push([entry, from]);
    }

    return neighbors;
  }

  // Cleanup all knowledge of the coordinate system ``id``.
  public static forget(id: CoordinateSystemIdentifier) {
    this.embeddings.delete(id);

    for (const from of CoordinateSystemReachability.getComponent(id))
      this.embeddings.get(from)?.delete(id);
  }

  private static embeddings = new Map<CoordinateSystemIdentifier, Map<CoordinateSystemIdentifier, RegisteredEmbedding>>();
};

// A singleton database of all transformations between coordinate systems that have been discovered by inverting registered embeddings and composing embeddings.
class DiscoveredCoordinateSystemEmbeddings {
  // Find an embedding from ``from`` into ``into`` and return the corresponding transformation.
  // Return ``null`` if the systems are unrelated.
  // When ``reactive`` is set, we touch a Vue reactive variable so that changes
  // to that transformation lead to this code path being reevaluated.
  // Note: Currently, reactivity is not supported when the result is "null".
  public static get(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier, reactive: boolean) {
    let embedding = null;
    if (this.embeddings.has(from) && this.embeddings.get(from)!.has(into)) {
      embedding = this.embeddings.get(from)!.get(into);
    } else {
      if (!CoordinateSystemReachability.isReachable(from, into))
        return null;

      let embeddingMatrix = new Flatten.Matrix(1, 0, 0, 1);

      let current = from;

      for (let [from_, into_] of this.getEmbeddingPath(from, into)) {
        this.registerDependency([from, into], [from_, into_]);

        let embeddingStepMatrix = RegisteredCoordinateSystemEmbeddings.get(from_, into_, false)!;
        if (current == into_) {
          embeddingStepMatrix = inverse(embeddingStepMatrix);
          [from_, into_] = [into_, from_];
        }

        embeddingMatrix = embeddingStepMatrix.multiply(embeddingMatrix);

        current = into_;
      }

      const embedding = new DiscoveredEmbedding(embeddingMatrix);

      if (reactive)
        embedding.touch();

      if (!this.embeddings.has(from))
        this.embeddings.set(from, new Map());

      this.embeddings.get(from)!.set(into, embedding);

      return embedding.embedding;
    }

    if (reactive)
      embedding!.touch();

    return embedding!.embedding;
  }

  private static registerDependency([discoveredFrom, discoveredInto]: [CoordinateSystemIdentifier, CoordinateSystemIdentifier], [registeredFrom, registeredInto]: [CoordinateSystemIdentifier, CoordinateSystemIdentifier]) {
    if (!this.dependents.has(registeredFrom))
      this.dependents.set(registeredFrom, new Map());

    if (!this.dependents.get(registeredFrom)!.has(registeredInto))
      this.dependents.get(registeredFrom)!.set(registeredInto, []);

    this.dependents.get(registeredFrom)!.get(registeredInto)!.push([discoveredFrom, discoveredInto]);
  }

  private static getEmbeddingPath(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier) {
      type Path = Array<[CoordinateSystemIdentifier, CoordinateSystemIdentifier]>;
      type QueueEntry = {
        current: CoordinateSystemIdentifier,
        path: Path
      };
      const queue = [] as QueueEntry[];
      queue.push({current: from, path: []});

      const seen = new Set([from]);

      while (true) {
        const {current, path} = queue.shift()!;

        if (current == into)
          return path;

        for (const [from_, into_] of RegisteredCoordinateSystemEmbeddings.getNeighbors(current)) {
          const target = from_ == current ? into_ : from_;
          if (seen.has(target))
            continue;

          seen.add(target);

          queue.push({current: target, path: path.concat([[from_, into_]])});
        }
      }
  }

  // Notify all consumers of ``get(reactive=true)`` that all embeddings
  // depending upon the registered embedding ``from`` and ``into`` might have
  // changed.
  public static invalidateDependentEmbeddings(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier) {
    if (!this.dependents.has(from))
      return;

    if (!this.dependents.get(from)!.has(into))
      return;

    for (const [from_, into_] of this.dependents.get(from)!.get(into)!) {
      const embedding = this.embeddings.get(from_)!.get(into_)!;
      embedding.invalidate();
      this.embeddings.get(from_)!.delete(into_);
    }

    this.dependents.get(from)!.delete(into);
  }

  // Clean the coordinate system ``id`` from this database (when the coordinate
  // system is not referenced anywhere anymore.)
  public static forget(id: CoordinateSystemIdentifier) {
    this.embeddings.delete(id);
    this.dependents.delete(id);
    for (const from of CoordinateSystemReachability.getComponent(id)) {
      this.embeddings.get(from)?.delete(id);
      this.dependents.get(from)?.delete(id);
    }
  }

  private static embeddings = new Map<CoordinateSystemIdentifier, Map<CoordinateSystemIdentifier, DiscoveredEmbedding>>();
  private static dependents = new Map<CoordinateSystemIdentifier, Map<CoordinateSystemIdentifier, Array<[CoordinateSystemIdentifier, CoordinateSystemIdentifier]>>>;
};

// A singleton database that stores which coordinate systems are related by
// registered embeddings, i.e., it tracks the connected components of
// coordinate systems.
class CoordinateSystemReachability {
  // Return whether ``from`` and ``into`` are in the same connected component.
  public static isReachable(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier): boolean {
    if (from == into)
      return true;

    if (!this.coordinateSystemComponents.has(from))
      return false;
    return this.coordinateSystemComponents.get(from)!.has(into);
  }

  // Declare that ``from`` and ``into`` are now in the same connected component
  // (assumes that before they were not.)
  public static registerEmbedding(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier) {
    if (!this.embeddings.has(from))
      this.embeddings.set(from, new Set());

    this.embeddings.get(from)!.add(into);

    this.mergeComponents(from, into);
  }

  private static mergeComponents(a: CoordinateSystemIdentifier, b: CoordinateSystemIdentifier) {
    const aComponent = this.coordinateSystemComponents.get(a) || new Set([a]);
    const bComponent = this.coordinateSystemComponents.get(b) || new Set([b]);

    console.assert(!aComponent.has(b));
    console.assert(!bComponent.has(a));

    const component = new Set([...aComponent, ...bComponent]);

    for (const entry of component)
      this.coordinateSystemComponents.set(entry, component);
  }

  // Declare that ``from`` and ``into`` are not in the same connected component
  // anymore.
  public static forgetEmbedding(from: CoordinateSystemIdentifier, into: CoordinateSystemIdentifier) {
    this.embeddings.get(from)!.delete(into);

    const component = this.getComponent(from);

    for (const entry of component)
      this.coordinateSystemComponents.set(entry, new Set([entry]));

    for (const from_ of this.embeddings.keys())
      if (component.has(from_))
        for (const into_ of this.embeddings.get(from_)!)
          this.mergeComponents(from_, into_);

  }

  // Return all the coordinate systems that are in the same connected component
  // as ``from``.
  public static getComponent(from: CoordinateSystemIdentifier) {
    return this.coordinateSystemComponents.get(from) || new Set([from]);
  }

  // Remove the coordinate system ``id`` from this database when it is not
  // referenced anywhere anymore.
  public static forget(id: CoordinateSystemIdentifier) {
    for (const other of this.coordinateSystemComponents.get(id) || [])
      this.coordinateSystemComponents.get(other)?.delete(id);
    this.coordinateSystemComponents.delete(id);
  }

  private static coordinateSystemComponents = new Map<CoordinateSystemIdentifier, Set<CoordinateSystemIdentifier>>();
  private static embeddings = new Map<CoordinateSystemIdentifier, Set<CoordinateSystemIdentifier>>();
};
