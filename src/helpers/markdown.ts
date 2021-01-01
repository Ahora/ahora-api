import remark from "remark";
import DocSource from "../models/docSource";
import User from "../models/users";
const github = require("remark-github");
const html = require('remark-html');
import sanitize from "rehype-sanitize";

export const markdownToHTML = async (markdown: string, docSource?: DocSource): Promise<string> => {

    return new Promise<string>(async (resolve, reject) => {
        let remarkInstance: any = remark();//.use(sanitize);

        if (docSource) {
            remarkInstance = remarkInstance.use(github, {
                repository: `${docSource!.organization}/${docSource!.repo}`
            });
        }
        remarkInstance.use(html, { sanitize: true }).process(markdown, (error: any, file: any) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(String(file));
            }
        });
    });
}

export const extractMentionsFromMarkdown = async (markdown: string): Promise<User[]> => {
    const mentions: string[] = [];

    var myRegexp = /@(\w+)/;
    const re = new RegExp(myRegexp, "g");
    let match;
    while (match = re.exec(markdown)) {
        mentions.push(match[1]);
    }

    const usersFromDB = await User.findAll({ where: { username: mentions }, attributes: ["id", "username"] });

    return usersFromDB;
}

export const replaceMentions = (markdown: string, mentions: string[]): string => {

    for (let index = 0; index < mentions.length; index++) {
        var regEx = new RegExp(`@${mentions[index]}`, "ig");
        markdown = markdown.replace(regEx, `[@${mentions[index]}](https://github.com/${mentions[index]})`)
    }
    return markdown;
}

export const handleMentions = async (markdown: string, mentions: User[] | undefined = undefined): Promise<{ markdown: string, mentions: User[] }> => {
    if (!mentions) {
        mentions = await extractMentionsFromMarkdown(markdown);
    }
    const realDBUsers = mentions.map((user) => user.username);
    const replacesString: string = replaceMentions(markdown, realDBUsers);
    return { markdown: replacesString, mentions: mentions };
}