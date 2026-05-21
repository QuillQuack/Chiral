import { prisma } from "./prisma";

interface NotifyParams {
  type: string;
  recipientId: string;
  actorId: string;
  postId?: string;
  commentId?: string;
}

export async function notify(params: NotifyParams) {
  if (params.recipientId === params.actorId) return;

  await prisma.notification.create({
    data: {
      type: params.type,
      recipientId: params.recipientId,
      actorId: params.actorId,
      postId: params.postId,
      commentId: params.commentId,
    },
  });
}
