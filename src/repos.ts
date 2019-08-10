import { GitHubClient } from "./client";
import { Repo } from "./data-types";

export async function getRepo(owner: string, name: string, client: GitHubClient): Promise<Repo> {
    let repoInfo = await client.query<RepoInfo, QueryVars>(getInitialRepoInfoSql, {
        owner,
        name
    });
    if (!repoInfo || !repoInfo.repository) return null;
    let r = repoInfo.repository;
    let repo: Repo = {
        // basic
        id: r.id,
        owner,
        name,
        license: r.licenseInfo ? r.licenseInfo.name : null,
        codeOfConduct: r.codeOfConduct ? r.codeOfConduct.url : null,
        createdAt: r.createdAt ? new Date(r.createdAt) : null,
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : null,
        pushedAt: r.pushedAt ? new Date(r.pushedAt) : null,
        isFork: r.isFork,
        description: r.description,
        language: r.primaryLanguage ? r.primaryLanguage.name : null,
        // star
        starCount: r.stargazers ? r.stargazers.totalCount : 0,
        stars: [],
        // watch
        watchCount: r.watchers ? r.watchers.totalCount : 0,
        // fork
        forkCount: r.forkCount,
        directForkCount: r.forks ? r.forks.totalCount : 0,
        forks: [],
        // branch
        branchCount: r.refs ? r.refs.totalCount : 0,
        defaultBranchName: r.defaultBranchRef ? r.defaultBranchRef.name : "",
        defaultBranchCommitCount: (r.defaultBranchRef && r.defaultBranchRef.target) ? r.defaultBranchRef.target.history.totalCount : 0,
        // release
        releaseCount: r.releases ? r.releases.totalCount : 0,
        // issue
        issues: [],
        // pull request
        pulls: [],
        // contributor
        contributors: []
    };
    return repo;
}

type RepoInfo = {
    repository: {
        owner: {
            login: string;
        };
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        pushedAt: string;
        isFork: boolean;
        description: string;
        primaryLanguage: {
            name: string;
        };
        refs: {
            totalCount: number;
        };
        defaultBranchRef: {
            name: string;
            target: {
                history: {
                    totalCount: number;
                };
            };
        };
        releases: {
            totalCount: number;
        };
        stargazers: {
            totalCount: number;
        };
        watchers: {
            totalCount: number;
        };
        forkCount: number;
        forks: {
            totalCount: number;
        };
        licenseInfo: {
            name: string;
        };
        codeOfConduct: {
            url: string;
        };
    };
};

type QueryVars = {
    owner: string;
    name: string;
}

const getInitialRepoInfoSql = `query getRepo($owner: String!, $name: String!) {
    rateLimit {
        resetAt
        remaining
        cost
    }
    repository(owner: $owner, name: $name) {
        owner {
            login
        }
        name
        id
        createdAt
        updatedAt
        pushedAt
        isFork
        description
        primaryLanguage {
            name
        }
        refs(refPrefix: "refs/heads/") {
            totalCount
        }
        defaultBranchRef {
            name
            target {
                ... on Commit {
                    history(author: {}) {
                        totalCount
                    }
                }
            }
        }
        releases {
            totalCount
        }
        stargazers {
            totalCount
        }
        watchers {
            totalCount
        }
        forkCount
        forks {
            totalCount
        }
        licenseInfo {
            name
        }
        codeOfConduct {
            url
        }
    }
}
`
