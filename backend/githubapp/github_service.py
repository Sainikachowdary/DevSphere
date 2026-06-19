import requests


def fetch_repositories(username, token=None):
    if not username:
        return [], "GitHub username is not set in your profile."

    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"

    repos = []
    page = 1
    while True:
        url = f"https://api.github.com/users/{username}/repos?per_page=100&page={page}&sort=updated"
        response = requests.get(url, headers=headers)

        if response.status_code == 404:
            return [], f'GitHub user "{username}" not found.'
        if response.status_code == 403:
            return [], "GitHub API rate limit exceeded. Add a GitHub token in your profile to increase the limit."
        if response.status_code != 200:
            return [], f"GitHub API error: {response.status_code}"

        data = response.json()
        if not data:
            break
        repos.extend(data)
        if len(data) < 100:
            break
        page += 1

    return repos, None
