import { Store } from 'vuex'

declare module '@vue/runtime-core' {
  interface State {
    raw: string,
  }

  interface ComponentCustomProperties {
    $store: Store<State>
  }
}

