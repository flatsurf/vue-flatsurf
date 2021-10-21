<script lang="ts">
import YAML from "yaml";
import Flatten from "@flatten-js/core";

import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import FlowComponent from "@/flatsurf/FlowComponent";
import Automorphism from "@/flatsurf/Automorphism";
import Vector from "@/geometry/Vector";
import CoordinateSystem from "@/geometry/CoordinateSystem";

import ISurface from "@/flatsurf/ISurface";

@Component
export default class Parser extends Vue {
  @Prop({ required: true, type: String }) raw!: string;

  private readonly idealCoordinateSystem = new CoordinateSystem(true);

  protected parsed: ISurface | null = null;

  render() {
    if (this.$scopedSlots.default != null)
      return this.$scopedSlots.default({parsed: this.parsed});
  }

  @Watch("raw", { immediate: true })
  onRawChanged() {
    try {
      const parsed = YAML.parse(this.raw);

      const vertical = parsed.vertical || {x: 0, y: 1};
      const angle = new Vector(this.idealCoordinateSystem, 0, 1).angleTo(new Vector(this.idealCoordinateSystem, vertical.x, vertical.y));

      const rotatedCoordinateSystem = new CoordinateSystem(true);
      rotatedCoordinateSystem.embedInto(this.idealCoordinateSystem, new Flatten.Matrix().rotate(angle));

      const triangulation = FlatTriangulation.parse(parsed, rotatedCoordinateSystem);
      const components = (parsed.components || []).map((component: any) => FlowComponent.parse(component, rotatedCoordinateSystem));
      const automorphisms = (parsed.automorphisms || []).map((automorphism: any) => Automorphism.parse(automorphism));

      this.parsed = {
        triangulation,
        components,
        automorphisms,
        coordinateSystem: this.idealCoordinateSystem,
      }
      this.$emit('ok');
    } catch(e) {
      this.$emit('error', e.message);
    }
  }
}
</script>

