function getMods() {
  const urls = [];
  const ver = document.getElementById("selectVersion");

  fetch("https://mohammedkhalidmc.github.io/Auto-Downloader/json/mods.json")
    .then(res => res.json())
    .then(data => {
      const promises = data.mods.map(mod => {
        const apiURL = `https://api.modrinth.com/v2/project/${mod.name}/version?loaders=["fabric"]&game_versions=["${ver.value}"]`;

        return fetch(apiURL)
          .then(res => {
            if (!res.ok) throw new Error(`${mod.name} fetch failed (${res.status})`);
            return res.json();
          })
          .then(versions => {
            if (!versions.length) {
              console.warn(`⚠️ No versions found for ${mod.name} (${ver.value})`);
              const warning = document.createElement("p");
              warning.textContent = `⚠️ No versions found for ${mod.name} (${ver.value})`;
              document.getElementById("container").appendChild(warning);
              return;
            }

            const latestVersion = versions[0];
            const fileUrl = latestVersion.files[0].url;
            urls.push(fileUrl);
            console.log(`✅ ${mod.name} → ${fileUrl}`);
          })
          .catch(err => console.warn(`❌ ${mod.name} skipped:`, err.message));
      });

      return Promise.all(promises).then(() => {
        const DownloadBtn = document.createElement("button");
        DownloadBtn.textContent = "Download";
        DownloadBtn.onclick = async () => {
          const zip = new JSZip();

          for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const filename = url.split("/").pop();

            const res = await fetch(url);
            const blob = await res.blob();
            zip.file(filename, blob);
          }

          const content = await zip.generateAsync({ type: "blob" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(content);
          a.download = "mods.zip";
          a.click();
        };
        document.getElementById("container").appendChild(DownloadBtn);
      });
    });
}
