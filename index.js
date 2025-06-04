let users = [];

async function fetchUsers() {
  const response = await fetch("https://randomuser.me/api/?results=20");
  const data = await response.json();
  users = data.results;
  return users;
}

function renderUsers(users) {
  const tbody = document.querySelector("#tbl-users tbody");
  tbody.innerHTML = "";
  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td><img src="${user.picture.thumbnail}" alt="photo"></td>
        <td>${user.name.first} ${user.name.last}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById("fetch-users").addEventListener("click", async () => {
  users = await fetchUsers();
  renderUsers(users);
});
