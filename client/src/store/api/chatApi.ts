import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const baseQueryWithToken = fetchBaseQuery({
  baseUrl: `${serverUrl}/chat`,
  credentials: "include",
});

const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithToken,
  tagTypes: ["Chat", "Message", "ChatList"],

  endpoints: (builder) => ({
    myChats: builder.query({
      query: () => ({
        url: "/myChats",
        credentials: "include",
      }),
      providesTags: ["ChatList"],
    }),

    chatDetails: builder.query({
      query: ({ chatId, populate = false }) => {
        let url = `/${chatId}`;
        if (populate) url += "?populate=true";
        return {
          url,
          credentials: "include",
        };
      },
      providesTags: ({ chatId }) => [{ type: "Chat", id: chatId }],
    }),

    getMessages: builder.query({
      query: ({ chatId, page }) => ({
        url: `/message/${chatId}?page=${page}`,
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),

    sendAttachments: builder.mutation({
      query: (data) => ({
        url: "/message",
        method: "POST",
        credentials: "include",
        body: data,
      }),
    }),

    myGroups: builder.query({
      query: () => ({
        url: "/my/groups",
        credentials: "include",
      }),
      providesTags: ["ChatList"],
    }),

    newGroup: builder.mutation({
      query: (data) => ({
        url: "/new",
        method: "POST",
        credentials: "include",
        body: data,
      }),
      invalidatesTags: ["ChatList"],
    }),

    renameGroup: builder.mutation({
      query: ({ chatId, name }) => ({
        url: `/${chatId}`,
        method: "PUT",
        credentials: "include",
        body: { name },
      }),
      invalidatesTags: ({ chatId }) => [{ type: "Chat", id: chatId }],
    }),

    removeGroupMember: builder.mutation({
      query: ({ chatId, userId }) => ({
        url: `/removemember`,
        method: "DELETE",
        credentials: "include",
        body: { chatId, userId },
      }),
      invalidatesTags: ({ chatId }) => [{ type: "Chat", id: chatId }],
    }),

    addGroupMembers: builder.mutation({
      query: ({ members, chatId }) => ({
        url: `/addmembers`,
        method: "PUT",
        credentials: "include",
        body: { members, chatId },
      }),
      invalidatesTags: ({ chatId }) => [{ type: "Chat", id: chatId }],
    }),

    deleteChat: builder.mutation({
      query: (chatId) => ({
        url: `/${chatId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ({ chatId }) => [{ type: "Chat", id: chatId }],
    }),

    leaveGroup: builder.mutation({
      query: (chatId) => ({
        url: `/leave/${chatId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ({ chatId }) => [{ type: "Chat", id: chatId }],
    }),
  }),
});

export default chatApi;
export const {
  useMyChatsQuery,
  useChatDetailsQuery,
  useGetMessagesQuery,
  useSendAttachmentsMutation,
  useMyGroupsQuery,
  useNewGroupMutation,
  useRenameGroupMutation,
  useRemoveGroupMemberMutation,
  useAddGroupMembersMutation,
  useDeleteChatMutation,
  useLeaveGroupMutation,
} = chatApi;
