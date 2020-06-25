import remark from "remark";
import DocSource from "../models/docSource";
const github = require("remark-github");
const html = require('remark-html')

export const markdownToHTML = async (markdown: string, docSource?: DocSource): Promise<string> => {

    return new Promise<string>(async (resolve, reject) => {
        let remarkInstance: any = remark();

        if (docSource) {
            remarkInstance = remarkInstance.use(github, {
                repository: `${docSource!.organization}/${docSource!.repo}`
            });
        }
        remarkInstance.use(html).process(markdown, (error: any, file: any) => {
            resolve(String(file));
        });
    });
}