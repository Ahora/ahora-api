import Mention from "../models/mention"

export const updateMentions = async (userIds: number[], docId: number, commentId: number | null = null) => {
    await Mention.destroy({ where: { docId, commentId } });

    const bulkList = userIds.map((userId: number) => {
        return { userId: userId, docId: docId, commentId };
    });

    await Mention.bulkCreate(bulkList);
}