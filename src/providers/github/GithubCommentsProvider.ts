import { ICommentProvider, CommentInput } from "../ICommentsProvider";
import { RestCollectorClient, RestCollectorRequest } from "rest-collector";
import { decorateGithubRequest } from "./decorateGithubRequest";

const githubCommentClient = new RestCollectorClient("https://api.github.com/repos/{organizationId}/{repository}/issues/{issueId}/comments", {
    decorateRequest: decorateGithubRequest
});

const githubUpdateDeleteCommentsClient = new RestCollectorClient("https://api.github.com/repos/{organizationId}/{repository}/issues/comments/{commentId}", {
    decorateRequest: decorateGithubRequest
});
export default class GithubCommentsProvider implements ICommentProvider {
    public async addComment(commentInput: CommentInput): Promise<number> {

        const result = await githubCommentClient.post({
            bag: commentInput.user,
            params: {
                organizationId: commentInput.docSource.organization,
                repository: commentInput.docSource.repo,
                issueId: commentInput.doc.sourceId
            },
            data: {
                body: commentInput.comment.comment
            }
        });

        return result.data.id;
    }

    public async putComment(commentInput: CommentInput): Promise<number> {
        const result = await githubUpdateDeleteCommentsClient.patch({
            bag: commentInput.user,
            params: {
                organizationId: commentInput.docSource.organization,
                repository: commentInput.docSource.repo,
                commentId: commentInput.comment.sourceId,
            },
            data: {
                body: commentInput.comment.comment
            }
        });

        return result.data.id;
    }

    public async deleteComment(commentInput: CommentInput): Promise<void> {
        await githubUpdateDeleteCommentsClient.delete({
            bag: commentInput.user,
            params: {
                organizationId: commentInput.docSource.organization,
                repository: commentInput.docSource.repo,
                commentId: commentInput.comment.sourceId,
            }
        });
    }
}