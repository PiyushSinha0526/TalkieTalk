import { serverUrl } from "@/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQueryWithToken = fetchBaseQuery({
  baseUrl: `${serverUrl}/user`,
  credentials: "include",
});

const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithToken,
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (userData) => ({
        url: "/signup",
        method: "POST",
        body: userData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
    }),
    editProfile: builder.mutation({
      query: (data) => ({
        url: "/editprofile",
        method: "PUT",
        credentials: "include",
        body: data,
      }),
    })
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useEditProfileMutation
} = authApi;

export default authApi;
