import remark from "remark";
import DocSource from "../models/docSource";
const github = require("remark-github");
const html = require('remark-html')

export const markdownToHTML = async (markdown: string, docSource: DocSource): Promise<string> => {

    return new Promise<string>(async (resolve, reject) => {
        remark().
            use(github, {
                repository: `${docSource!.organization}/${docSource!.repo}`
            }).
            use(html).process(markdown, (error, file) => {
                resolve(String(file));
            });
    });
}