import Vue, { PluginFunction, VueConstructor } from 'vue';


interface InstallFunction extends PluginFunction<any> {
  installed?: boolean;
}

declare const VueFlatsurf: { install: InstallFunction };
export default VueFlatsurf;

export const VueFlatsurfSample: VueConstructor<Vue>;
