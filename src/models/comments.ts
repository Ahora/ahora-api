import { DataTypes } from 'sequelize';
import db from '.';
import Doc from './docs';
import User from './users';
import { SourceableModel } from "./../routers/sync/BaseSync";
import DocSource from './docSource';
import { extractMentionsFromMarkdown, markdownToHTML, handleMentions } from '../helpers/markdown';
import { updateMentions } from '../helpers/mention';
import { addUserToWatchersList } from '../helpers/docWatchers';
import { updateLastView } from '../helpers/docs/db';
import { updateCommentsNumberAndTime } from '../helpers/comments';

export enum CommentType {
    comment = 0,
    statusChanged = 1,
    isPrivateChanged = 2,
    labelAdded = 3,
    labelRemoved = 4,
    assigneeChanged = 5
}

class Comment extends SourceableModel {
    public id!: number;
    public comment!: string;
    public htmlComment!: string | null;
    public pinned!: boolean;
    public parentId!: number | null;
    public docId!: number;
    public authorUserId!: number;
    public commentType!: CommentType;
    public oldValue!: number | null;
    public newValue!: number | null;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Comment.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    htmlComment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    docId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    commentType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: CommentType.comment
    },
    commentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    oldValue: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    newValue: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    authorUserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    docSourceId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db.sequelize,
    timestamps: true,
    tableName: "comments",
});

Comment.beforeSave(async (instance) => {
    if (instance.comment) {
        const result = await handleMentions(instance.comment);
        instance.htmlComment = await markdownToHTML(result.markdown);
    }
});

Comment.afterDestroy(async (instance) => {
    await Promise.all([
        updateCommentsNumberAndTime(instance.docId, new Date()),
        updateLastView(instance.docId, instance.authorUserId)
    ]);
});

Comment.afterSave(async (instance) => {

    await updateLastView(instance.docId, instance.authorUserId);

    let watchers: number[] = [instance.authorUserId];
    if (instance.comment) {
        const mentionUsers = await extractMentionsFromMarkdown(instance.comment);
        const mentionedUserIds = mentionUsers.map((user) => user.id);
        await updateMentions(mentionedUserIds, instance.docId, instance.id);

        const doc = await Doc.findOne({ where: { id: instance.docId } });

        if (!doc?.isPrivate) {
            watchers = [...watchers, ...mentionedUserIds];
        }
    }

    await updateCommentsNumberAndTime(instance.docId, instance.updatedAt);


    for (let index = 0; index < watchers.length; index++) {
        await addUserToWatchersList(instance.docId, watchers[index]);
    }

});

export const initAssociationComments = () => {
    Comment.belongsTo(Doc, { foreignKey: "docId", onDelete: 'CASCADE', as: "comments" });
    Comment.belongsTo(Comment, { foreignKey: "parentId", onDelete: 'CASCADE' });
    Comment.hasMany(Comment, { foreignKey: "parentId", onDelete: 'CASCADE' });
    Comment.belongsTo(User, { foreignKey: "authorUserId", onDelete: 'CASCADE', as: "author" });
    Comment.belongsTo(DocSource, { foreignKey: "docSourceId", onDelete: 'CASCADE' });
}

export default Comment;