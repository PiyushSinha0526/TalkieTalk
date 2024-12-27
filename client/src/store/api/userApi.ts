import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const baseQueryWithToken = fetchBaseQuery({
  baseUrl: `${serverUrl}/user`,
  credentials: "include",
});

const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithToken,
  tagTypes: ["User", "Chat"],

  endpoints: (builder) => ({
    userSearch: builder.query({
      query: (name) => `/search?name=${name}`,
      providesTags: (result) => (result ? ["User"] : []),
    }),

    sendFriendRequest: builder.mutation({
      query: (data) => ({
        url: "/sendrequest",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getNotifications: builder.query({
      query: () => `/notifications`,
      keepUnusedDataFor: 0,
      providesTags: ["User"],
    }),

    acceptFriendRequest: builder.mutation({
      query: (data) => ({
        url: "/acceptrequest",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    availableFriends: builder.query({
      query: (chatId) => ({
        url: `/friends${chatId ? `?chatId=${chatId}` : ""}`,
      }),
      providesTags: ["Chat"],
    }),
  }),
});

export default userApi;
export const {
  useLazyUserSearchQuery,
  useSendFriendRequestMutation,
  useGetNotificationsQuery,
  useAcceptFriendRequestMutation,
  useAvailableFriendsQuery,
} = userApi;
