/**
 * This is a hack for importing multiple modules into the same namespace.
 *
 * By exporting all exports from specific modules as defaults in a proxy
 * namespace module, one is able to import the into the same namespace:
 *
 * ```
 * import * as plugin from '../plugins/namespace';
 * ```
 *
 * which gives access to
 *
 * ```
 * plugin.DocumentSourceLinker
 * plugin.MyPlugin
 * ```
 */

export * from './DocumentSourceLinker';
