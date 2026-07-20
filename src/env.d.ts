/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import('./lib/db/schema').User | null;
    /** Idioma da requisição. '/en/...' => 'en'; qualquer outra rota => 'pt'. */
    lang: import('./i18n').Lang;
  }
}
