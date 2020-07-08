<template>
    <v-app>
        <v-main>
            <v-container fluid fill-height>
                <svg class="surface" width="100%" height="100%">
                    <rect width=300 height=200 />
                </svg>
            </v-container>
            <v-dialog v-model="editor" fullscreen hide-overlay transition="dialog-bottom-transition">
                <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" color="green" dark dense small fixed bottom right fab>
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                </template>
                <v-card>
                    <v-toolbar dark cards color="green">
                        <v-btn icon dark @click="editor = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
                        <v-card-title>Flat Triangulation Data</v-card-title>
                    </v-toolbar>
                    <v-form class="pa-6 pt-6">
                        <v-textarea class="editor" v-model="raw" auto-grow filled rows="1" />
                    </v-form>
                </v-card>
            </v-dialog>
        </v-main>
</v-app>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { VueFlatsurfSample } from '@/entry';
import square from "!!raw-loader!./square.txt";
import YAML from "yaml";

@Component({
    components: {
        VueFlatsurfSample,
    }
})
export default class App extends Vue {
    raw: string = square;
    editor: boolean = false;
    
    get surface() {
        return YAML.parse(this.raw);
    }
}
</script>
<style scoped>
.editor {
  font-family: monospace;
}
</style>
