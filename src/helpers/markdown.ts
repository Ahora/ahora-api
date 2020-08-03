import remark from "remark";
import DocSource from "../models/docSource";
import User from "../models/users";
const github = require("remark-github");
const html = require('remark-html')

export const markdownToHTML = async (markdown: string, docSource?: DocSource): Promise<string> => {

    return new Promise<string>(async (resolve, reject) => {
        let remarkInstance: any = remark();

        if (docSource) {
            remarkInstance = remarkInstance.use(github, {
                repository: `${docSource!.organization}/${docSource!.repo}`
            });
        } else {
            const mentionedResult = await handleMentions(markdown);
            markdown = mentionedResult.markdown;
        }

        remarkInstance.use(html).process(markdown, (error: any, file: any) => {
            resolve(String(file));
        });
    });
}

export const extractMentionsFromMarkdown = (markdown: string): string[] => {
    const mentions: string[] = [];

    var myRegexp = /@(\w+)/;
    const re = new RegExp(myRegexp, "g");
    let match;
    while (match = re.exec(markdown)) {
        mentions.push(match[1]);
    }
    return mentions;
}

export const replaceMentions = (markdown: string, mentions: string[]): string => {

    for (let index = 0; index < mentions.length; index++) {
        var regEx = new RegExp(`@${mentions[index]}`, "ig");
        markdown = markdown.replace(regEx, `[@${mentions[index]}](https://github.com/${mentions[index]})`)
    }
    return markdown;
}

export const handleMentions = async (markdown: string): Promise<{ markdown: string, mentions: User[] }> => {
    const mentions: string[] = extractMentionsFromMarkdown(markdown);
    const usersFromDB = await User.findAll({ where: { username: mentions }, attributes: ["id", "username"] });
    const realDBUsers = usersFromDB.map((user) => user.username);
    const replacesString: string = replaceMentions(markdown, realDBUsers);
    return { markdown: replacesString, mentions: usersFromDB };
}