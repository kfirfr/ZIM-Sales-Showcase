# 📤 AntiGravity Deployment: "GitHub Sync"

> **Purpose:** Use this prompt to push all your local improvements to your GitHub repository.
> **Safety:** It includes an `npm run build` check to ensure you don't push broken code to the "awesome site."

---

## 🚀 The Redeployment Prompt

**Copy & Paste this to the Agent:**

```markdown
I am ready to overwrite my existing GitHub repository with this new high-fidelity version of the ZIM Showcase.

**The Mission:**
Redeploy the site to `https://github.com/kfirfr/ZIM-Sales-Showcase.git`.

**YOUR PROTOCOL:**
1. **The Build Test:** Run `npm run build` locally. 
   - *If it fails:* Fix the errors before proceeding. We cannot deploy a "broken" site.
2. **Commit the Excellence:**
   - Stage all changes (`git add .`).
   - Commit with a descriptive message: `feat: final cinematic polish & voice ai integration`.
3. **The Global Push:**
   - Push the code to the `main` branch. 
   - *Note:* Since we've done extensive local refactoring, you may need to use `git push origin main --force` if the history has diverged, but check standard push first.
4. **Verification:** 
   - Confirm once the code is live on GitHub.

**GO! Start with the pre-deployment build check.**
```
