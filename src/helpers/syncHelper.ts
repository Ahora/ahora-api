
import DocSource from "../models/docSource";
import { KubeConfig, CustomObjectsApi } from "@kubernetes/client-node";



const kc = new KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(CustomObjectsApi);

export const syncDocSource = async (source: DocSource) => {

    const cr: any = {
        "apiVersion": "argoproj.io/v1alpha1",
        "kind": "Workflow",
        "metadata": {
            "generateName": `ahora-api-sync-${source.id}-`,
        },
        "spec": {
            "arguments": {
                "parameters": [
                    { name: "id", value: `${source.id}` },
                    { name: "organization", value: `${source.organization}` },
                    { name: "repo", value: `${source.repo}` },
                    { name: "lastUpdated", value: `${source.lastUpdated}` },
                    { name: "organizationId", value: `${source.organizationId}` },
                ]
            },
            entrypoint: "github-exporter",
            workflowTemplateRef: {
                name: "ahoraexporter-github-exporter"
            }
        }
    };

    await k8sApi.createNamespacedCustomObject("argoproj.io", "v1alpha1", "master", "workflows", cr);
}