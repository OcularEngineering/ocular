import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {environment} from "../../../environments/environment";

export const appsApi = createApi({
  reducerPath: 'appsApi',
  baseQuery: fetchBaseQuery({ baseUrl: environment.baseUrl }),
  endpoints: (builder) => ({
    getApps: builder.query<string[], void>({
      query: () => `${environment.appServerUrl}/apps/`,
    }),
  }),
})

export const { useGetAppsQuery } = appsApi