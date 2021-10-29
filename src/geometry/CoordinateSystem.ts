/* ******************************************************************************
 * Copyright (c) 2020-2021 Julian Rüth <julian.rueth@fsfe.org>
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

import Vue from "vue";

import Flatten from "@flatten-js/core";

import Point from "./Point";
import Polygon from "./Polygon";
import Box from "./Box";
import Vector from "./Vector";
import Segment from "./Segment";
import Line from "./Line";

export type Coordinate = number;

// A registered or discovered embedding between two coordinate systems.
export type Embedding = {
  // The embedding as an invertible matrix; null if the embedding is not valid
  // anymore.
  embedding: Readonly<Flatten.Matrix> | null,
}

// Internal structure to keep track of explicitl registered embeddings between
// coordinate systems.
type RegisteredEmbedding = {
  embedding: Embedding;
  dependents: Array<{
    domain: CoordinateSystem,
    codomain: CoordinateSystem,
  }>;
}

// Return the inverse of the invertible matrix A.
// Naturally, this is not very stable numerically. Probably we shuold solve
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

export default class CoordinateSystem {
  public constructor(positive: boolean) {
    this.positive = positive;
  }

  public readonly positive: boolean;

  // Register an embedding from this coordinate system into `into`.
  // The returned embedding is a token that can be used to `reset()` the
  // embedding later or `embedInto()` differently.
  public embedInto(into: CoordinateSystem, token?: Embedding): Embedding;
  public embedInto(into: CoordinateSystem, embedding: Flatten.Matrix, token?: Embedding): Embedding;
  public embedInto(into: CoordinateSystem, embedding?: Embedding | Flatten.Matrix, token?: Embedding): Embedding {
    if (embedding !== undefined) {
      if ("embedding" in embedding) {
        console.assert(token === undefined);
        token = embedding;
        embedding = undefined;
      }
    }

    if (embedding === undefined) {
      console.assert(token === undefined);
      embedding = new Flatten.Matrix();
      if (this.positive !== into.positive)
        embedding = new Flatten.Matrix(1, 0, 0, -1);
      return this.embedInto(into, embedding, token);
    }

    console.assert(embedding instanceof Flatten.Matrix);
    if (embedding.tx == null || embedding.ty == null || !(embedding.a * embedding.d - embedding.b * embedding.c))
      throw Error(`Embedding matrix is not invertible: ${JSON.stringify(embedding)}`);

    let existing = this.lookup(into);

    if (existing == null) {
      if (token !== undefined)
        console.warn("No token expected when resetting embedding of coordinate systems. No embedding between these coordinate systems could be found.");
    } else {
      if (token === undefined)
        console.warn("Expected a token when resetting embedding of coordinate systems but no token found.");
      else if (token !== existing.embedding)
        console.warn("Expected correct token when resetting embedding of coordinate systems but the token was not the one last returned when the embedding was established.");
    }

    if (existing == null) {
      this.insert(into, embedding);
      existing = this.lookup(into)!;
    }

    console.assert(existing != null);
    console.assert(existing.embedding.embedding != null, "Invalidated embedding found in registered embeddings.");

    CoordinateSystem.update(existing!, embedding as Flatten.Matrix);

    return existing.embedding;
  }

  public reset(token: Embedding) {
    const from = CoordinateSystem.registered.get(this);
    if (from === undefined)
      throw Error("Cannot reset embedding of this coordinate systems as none is registered anymore.");
    for (const codomain of from.keys()) {
      const registered = from.get(codomain)!;
      if (registered.embedding == token) {
        CoordinateSystem.invalidate(registered);
        from.delete(codomain);
        if (from.size === 0)
          CoordinateSystem.registered.delete(this);
        return;
      }
    }

    throw Error("Cannot reset embedding. No embedding registered for this token.");
  }

  public embed(point: Point): Point;
  public embed(vector: Vector): Vector;
  public embed(segment: Segment): Segment;
  public embed(line: Line): Line;
  public embed(polygon: Box | Polygon): Polygon;
  public embed(value: Box | Point | Vector | Segment | Line | Polygon) : Point | Vector | Segment | Line | Polygon {
    const discovered = this === value.parent ? new Flatten.Matrix() : value.parent.discover(this);

    console.assert(discovered.tx != null && discovered.ty != null && discovered.a * discovered.d - discovered.b * discovered.c, "Discovered an embedding that is not invertible.", discovered);

    if (value instanceof Box) {
      const polygon = new Flatten.Polygon();
      polygon.addFace(value.toPoints().map((point) => this.embed(point).value));
      return new Polygon(this, polygon);
    } else if (value instanceof Point) {
      return new Point(this, value.value.transform(discovered));
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

  // The registered embeddings between coordinate systems.
  // Maps domain → codomain → embedding.
  private static registered: Map<CoordinateSystem, Map<CoordinateSystem, RegisteredEmbedding>> = new Map();

  // The discovered embeddings between coordinate systems.
  // Maps domain → codomain → embedding.
  private static discovered: Map<CoordinateSystem, Map<CoordinateSystem, Embedding>> = new Map();

  private lookup(into: CoordinateSystem): RegisteredEmbedding | null {
    return CoordinateSystem.registered.get(this)?.get(into) || null;
  }

  private insert(into: CoordinateSystem, embedding: Flatten.Matrix) {
    if (!CoordinateSystem.registered.has(this))
      CoordinateSystem.registered.set(this, new Map());
    console.assert(!CoordinateSystem.registered.get(this)!.has(into));
    CoordinateSystem.registered.get(this)!.set(into, {
      embedding: Vue.observable({
        embedding: Object.freeze(embedding),
      }),
      dependents: [],
    });
  }

  private static update(registered: RegisteredEmbedding, embedding: Flatten.Matrix) {
    if (registered.embedding.embedding === null)
      throw Error("Cannot update existing embedding if it is already invalidated.");

    if (registered.embedding.embedding.equalTo(embedding))
      return;

    CoordinateSystem.invalidate(registered);

    registered.embedding.embedding = Object.freeze(embedding);
  }

  private static invalidate(registered: RegisteredEmbedding) {
    if (registered.embedding.embedding === null)
      throw Error("Cannot invalidate embedding if it is already invalidated.");

    registered.embedding.embedding = null;

    for (const {domain, codomain} of registered.dependents) {
      if (!CoordinateSystem.discovered.has(domain))
        continue;
      if (!CoordinateSystem.discovered.get(domain)!.has(codomain))
        continue;
      
      const discovered = CoordinateSystem.discovered.get(domain)!.get(codomain)!;
      discovered.embedding = null;

      CoordinateSystem.discovered.get(domain)!.delete(codomain);
      if (CoordinateSystem.discovered.get(domain)!.size === 0)
        CoordinateSystem.discovered.delete(domain);
    }

    registered.dependents = [];
  }

  // The returned embedding is Vue.observable() so that users will notice when
  // its embedding is set to null or otherwise modified.
  private discover(into: CoordinateSystem): Flatten.Matrix {
    let discovered = undefined;

    console.assert(this !== into);

    if (CoordinateSystem.registered.has(this) && CoordinateSystem.registered.get(this)!.has(into))
      discovered = CoordinateSystem.registered.get(this)!.get(into)!.embedding;
    else if (CoordinateSystem.discovered.has(this) && CoordinateSystem.discovered.get(this)!.has(into))
      discovered = CoordinateSystem.discovered.get(this)!.get(into)!;
    else {
      const reachable = new Set<CoordinateSystem>();
      const path: Array<{
        definition: { embedding: Embedding } | { inverse: Embedding },
        dependency: RegisteredEmbedding,
      }> = [];

      const search = (from: CoordinateSystem): Embedding | null => {
        if (from === into) {
          let map = new Flatten.Matrix();
          for (const {definition, dependency} of path) {
            if ("embedding" in definition) {
              console.assert(definition.embedding.embedding);
              map = definition.embedding.embedding!.multiply(map);
            } else {
              console.assert(definition.inverse.embedding);
              map = map.multiply(inverse(definition.inverse.embedding!));
            }
            dependency.dependents.push({ domain: this, codomain: into }); 
          }
          const discovered = Vue.observable({
            embedding: Object.freeze(map)
          });

          if (!CoordinateSystem.discovered.has(this))
            CoordinateSystem.discovered.set(this, new Map());

          CoordinateSystem.discovered.get(this)!.set(into, discovered);

          return discovered;
        }

        const follow = (to: CoordinateSystem, definition: { embedding: Embedding } | { inverse: Embedding }, dependency: RegisteredEmbedding): Embedding | null => {
          if (reachable.has(to))
            return null;

          path.push({
            definition,
            dependency,
          });
          try {
            reachable.add(to);
            return search(to);
          } finally {
            path.pop();
          }
        };


        if (CoordinateSystem.registered.has(from)) {
          for (const to of CoordinateSystem.registered.get(from)!.keys()) {
            const dependency = CoordinateSystem.registered.get(from)!.get(to)!;
            const embedding = follow(to, { embedding: dependency.embedding }, dependency);
            if (embedding !== null)
              return embedding;
          }
        }

        // TODO: This is quite inefficient.
        for (const to of CoordinateSystem.registered.keys()) {
          if (CoordinateSystem.registered.get(to)!.has(from)) {
            const dependency = CoordinateSystem.registered.get(to)!.get(from)!;
            const embedding = follow(to, { inverse: dependency.embedding }, dependency);
            if (embedding !== null)
              return embedding;
          }
        }

        return null;
      }

      const embedding = search(this);

      if (embedding === null)
        throw Error("No embedding could be constructed between these coordinate systems.");

      console.assert(embedding.embedding !== null);

      return embedding.embedding!;
    }

    console.assert(discovered.embedding !== null);

    return discovered.embedding!;
  }
}

