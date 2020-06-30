
import Comment from "./../models/comments";
import Doc from "../models/docs";

export const updateCommentsNumberAndTime = async (docId: number, updateTime?: Date): Promise<void> => {
    const count = await Comment.count({
        where: { docId }
    });

    const updateDocParams: any = { commentsNumber: count };
    if (updateTime) {
        updateDocParams.updatedAt = updateTime;
    }

    Doc.update(updateDocParams, {
        where: { id: docId }
    });
}
