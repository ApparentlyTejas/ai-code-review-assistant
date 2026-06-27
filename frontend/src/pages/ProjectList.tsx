import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createProject, listProjects } from "../api/projects";

export function ProjectList() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useQuery({ queryKey: ["projects"], queryFn: listProjects });

  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [githubPat, setGithubPat] = useState("");

  const createMutation = useMutation({
    mutationFn: () => createProject(repoOwner, repoName, githubPat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setRepoOwner("");
      setRepoName("");
      setGithubPat("");
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <header className="page-header">
        <h1>Projects</h1>
      </header>

      <form onSubmit={handleSubmit} className="connect-repo-form">
        <h2>Connect a repo</h2>
        <label>
          Repo owner
          <input value={repoOwner} onChange={(e) => setRepoOwner(e.target.value)} placeholder="e.g. octocat" required />
        </label>
        <label>
          Repo name
          <input value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="e.g. Hello-World" required />
        </label>
        <label>
          GitHub personal access token
          <input
            type="password"
            value={githubPat}
            onChange={(e) => setGithubPat(e.target.value)}
            placeholder="ghp_..."
            required
          />
        </label>
        {createMutation.isError && <p className="error">Failed to connect repo. Check the token and repo name.</p>}
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Connecting..." : "Connect"}
        </button>
      </form>

      <h2>Your projects</h2>
      {isLoading && <p>Loading...</p>}
      <ul className="project-list">
        {projects?.map((project) => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`}>
              {project.repo_owner}/{project.repo_name}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
