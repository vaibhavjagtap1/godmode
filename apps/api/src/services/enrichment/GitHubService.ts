import fetch from 'node-fetch';

interface GitHubProfile {
  username: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  topLanguages: string[];
}

export class GitHubService {
  async enrich(email: string): Promise<GitHubProfile | null> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return null;
    }

    const headers = {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    try {
      const searchResponse = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(email)}`, { headers });
      if (!searchResponse.ok) {
        return null;
      }
      const searchData = (await searchResponse.json()) as { items?: Array<{ login: string }> };
      const username = searchData.items?.[0]?.login;
      if (!username) {
        return null;
      }

      const [userResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers })
      ]);

      if (!userResponse.ok || !reposResponse.ok) {
        return null;
      }

      const user = (await userResponse.json()) as Record<string, unknown>;
      const repos = (await reposResponse.json()) as Array<Record<string, unknown>>;
      const topLanguages = Array.from(new Set(repos.map((repo) => String(repo.language ?? '')).filter(Boolean))).slice(0, 5);

      return {
        username,
        name: (user.name as string | null) ?? null,
        bio: (user.bio as string | null) ?? null,
        company: (user.company as string | null) ?? null,
        location: (user.location as string | null) ?? null,
        blog: (user.blog as string | null) ?? null,
        publicRepos: Number(user.public_repos ?? 0),
        followers: Number(user.followers ?? 0),
        following: Number(user.following ?? 0),
        createdAt: String(user.created_at ?? ''),
        topLanguages
      };
    } catch {
      return null;
    }
  }
}
