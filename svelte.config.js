/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
export default {
  compilerOptions: {
    warningFilter: (warning) => {
      if (warning.code.startsWith('a11y_label_has_associated_control')) return false;
      if (warning.code.startsWith('a11y_autofocus')) return false;
      if (warning.code.startsWith('a11y_no_redundant_roles')) return false;
      return true;
    }
  }
}
