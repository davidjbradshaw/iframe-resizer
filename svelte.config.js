// The Svelte options for the package build, svelte-check and the unit tests.
// Given to svelte-check, it also stops it loading the examples' vite configs
export default {
  compilerOptions: {
    customElement: false,
  },
}
