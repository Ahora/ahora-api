import { ICommentProvider, CommentInput } from "../ICommentsProvider";
import { RestCollectorClient, RestCollectorRequest } from "rest-collector";
import User from "../../models/users";


const githubCommentClient = new RestCollectorClient("https://api.github.com/repos/{organizationId}/{repository}/issues/{issueId}/comments/{commentId}", {
    decorateRequest: (req: RestCollectorRequest, bag: User) => {
        req.headers.Authorization = `token ${bag.accessToken}`;
    }
});

export default class GithubCommentsProvider implements ICommentProvider {
    public async addComment(commentInput: CommentInput): Promise<number> {

        const result = await githubCommentClient.post({
            bag: commentInput.user,
            params: {
                organizationId: commentInput.docSource.organization,
                repository: commentInput.docSource.repo,
                issueId: commentInput.doc.docSourceId
            },
            data: {
                body: commentInput.comment.comment
            }
        });

        return result.data.id;
    }

    public async putComment(commentInput: CommentInput): Promise<number> {
        const result = await githubCommentClient.patch({
            bag: commentInput.user,
            params: {
                organizationId: commentInput.docSource.organization,
                repository: commentInput.docSource.repo,
                issueId: commentInput.doc.docSourceId,
                commentId: commentInput.comment.sourceId
            },
            data: {
                body: commentInput.comment.comment
            }
        });

        return result.data.id;
    }

    public async deleteComment(commentInput: CommentInput): Promise<void> {
        await githubCommentClient.delete({
            bag: commentInput.user,
            params: {
                organizationId: commentInput.docSource.organization,
                repository: commentInput.docSource.repo,
                issueId: commentInput.doc.docSourceId,
                commentId: commentInput.comment.sourceId,
            },
            data: {
                body: commentInput.comment.comment
            }
        });
    }
}