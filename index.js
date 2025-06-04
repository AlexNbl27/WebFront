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
    const gender = user.gender === "male" ? "👨" : "👩";
    tr.innerHTML = `
        <td><img src="${user.picture.thumbnail}" alt="photo"></td>
        <td>${user.name.first} ${user.name.last}</td>
        <td>${gender}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td>${user.dob.age}</td>
    `;
    tbody.appendChild(tr);
  });
}

function searchUsersByName(users, searchTerm) {
  return users.filter((user) =>
    `${user.name.first} ${user.name.last}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
}

document.getElementById("fetch-users").addEventListener("click", async () => {
  users = await fetchUsers();
  renderUsers(users);
});

document
  .getElementById("search-users")
  .addEventListener("input", async (event) => {
    const searchTerm = event.target.value;
    const filteredUsers = searchUsersByName(users, searchTerm);
    renderUsers(filteredUsers);
  });
