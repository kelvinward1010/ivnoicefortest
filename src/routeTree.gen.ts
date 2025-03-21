/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LayoutImport } from './routes/_layout'
import { Route as LayoutIndexImport } from './routes/_layout/index'
import { Route as LayoutProjectsIndexImport } from './routes/_layout/projects/index'
import { Route as LayoutInvoicesIndexImport } from './routes/_layout/invoices/index'
import { Route as LayoutAccountsIndexImport } from './routes/_layout/accounts/index'
import { Route as LayoutAccountsIdImport } from './routes/_layout/accounts/$id'
import { Route as LayoutProjectsProjectIdIndexImport } from './routes/_layout/projects/$projectId/index'
import { Route as LayoutProjectsProjectIdSowsSowIdImport } from './routes/_layout/projects/$projectId/sows/$sowId'

// Create/Update Routes

const LayoutRoute = LayoutImport.update({
  id: '/_layout',
  getParentRoute: () => rootRoute,
} as any)

const LayoutIndexRoute = LayoutIndexImport.update({
  path: '/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutProjectsIndexRoute = LayoutProjectsIndexImport.update({
  path: '/projects/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutInvoicesIndexRoute = LayoutInvoicesIndexImport.update({
  path: '/invoices/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutAccountsIndexRoute = LayoutAccountsIndexImport.update({
  path: '/accounts/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutAccountsIdRoute = LayoutAccountsIdImport.update({
  path: '/accounts/$id',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutProjectsProjectIdIndexRoute =
  LayoutProjectsProjectIdIndexImport.update({
    path: '/projects/$projectId/',
    getParentRoute: () => LayoutRoute,
  } as any)

const LayoutProjectsProjectIdSowsSowIdRoute =
  LayoutProjectsProjectIdSowsSowIdImport.update({
    path: '/projects/$projectId/sows/$sowId',
    getParentRoute: () => LayoutRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_layout': {
      preLoaderRoute: typeof LayoutImport
      parentRoute: typeof rootRoute
    }
    '/_layout/': {
      preLoaderRoute: typeof LayoutIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/accounts/$id': {
      preLoaderRoute: typeof LayoutAccountsIdImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/accounts/': {
      preLoaderRoute: typeof LayoutAccountsIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/invoices/': {
      preLoaderRoute: typeof LayoutInvoicesIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/projects/': {
      preLoaderRoute: typeof LayoutProjectsIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/projects/$projectId/': {
      preLoaderRoute: typeof LayoutProjectsProjectIdIndexImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/projects/$projectId/sows/$sowId': {
      preLoaderRoute: typeof LayoutProjectsProjectIdSowsSowIdImport
      parentRoute: typeof LayoutImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  LayoutRoute.addChildren([
    LayoutIndexRoute,
    LayoutAccountsIdRoute,
    LayoutAccountsIndexRoute,
    LayoutInvoicesIndexRoute,
    LayoutProjectsIndexRoute,
    LayoutProjectsProjectIdIndexRoute,
    LayoutProjectsProjectIdSowsSowIdRoute,
  ]),
])

/* prettier-ignore-end */
