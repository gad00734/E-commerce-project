//////////////////////////////////////////////////product///////////////////////////////////////////////////////////////////////// 
  let productId = 2;
  let editMode = false;
  let currentEditingRow = null;

  function toggleProductForm() {
    const form = document.getElementById("productForm");
    form.classList.toggle("d-none");

    if (!editMode) {
      document.getElementById("productForm").reset();
      document.getElementById("productSubmitBtn").textContent = "Add";
    }
  }

  document.getElementById("productForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value;
    const price = document.getElementById("productPrice").value;
    const qty = document.getElementById("productQty").value;

    if (editMode) {
      currentEditingRow.cells[2].textContent = name;
      currentEditingRow.cells[3].textContent = category;
      currentEditingRow.cells[4].textContent = `$${price}`;
      currentEditingRow.cells[5].textContent = qty;

      editMode = false;
      currentEditingRow = null;
      document.getElementById("productSubmitBtn").textContent = "Add";
    } else {
      const tbody = document.querySelector("#products table tbody");
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${productId}</td>
        <td><img src="https://via.placeholder.com/50" alt="Product" class="img-thumbnail"></td>
        <td>${name}</td>
        <td>${category}</td>
        <td>$${price}</td>
        <td>${qty}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editProduct(this)">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct(this)">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
      productId++;
    }
    this.reset();
    this.classList.add("d-none");
  });

  function deleteProduct(button) {
    if (confirm("Are you sure you want to delete this product?")) {
      const row = button.closest("tr");
      row.remove();
    }
  }

  function editProduct(button) {
    const row = button.closest("tr");
    const name = row.cells[2].textContent;
    const category = row.cells[3].textContent;
    const price = row.cells[4].textContent.replace('$', '');
    const qty = row.cells[5].textContent;

    document.getElementById("productName").value = name;
    document.getElementById("productCategory").value = category;
    document.getElementById("productPrice").value = price;
    document.getElementById("productQty").value = qty;

    const form = document.getElementById("productForm");
    if (form.classList.contains("d-none")) {
      form.classList.remove("d-none");
    }

    editMode = true;
    currentEditingRow = row;
    document.getElementById("productSubmitBtn").textContent = "Update";
  }

////////////////////////////////////////////////Admin/////////////////////////////////////////////////////////////
let adminId = 2;
let editAdminMode = false;
let currentEditingAdminRow = null;

function toggleAdminForm() {
  const form = document.getElementById("adminForm");
  form.classList.toggle("d-none");
  document.getElementById("adminForm").reset();
  document.getElementById("adminSubmitBtn").textContent = "Add Admin";
  editAdminMode = false;
  currentEditingAdminRow = null;
}

document.getElementById("adminForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("adminName").value;
  const email = document.getElementById("adminEmail").value;

  if (editAdminMode) {
    currentEditingAdminRow.cells[1].textContent = name;
    currentEditingAdminRow.cells[2].textContent = email;

    editAdminMode = false;
    currentEditingAdminRow = null;
    document.getElementById("adminSubmitBtn").textContent = "Add Admin";
  } else {
    const tbody = document.querySelector("#admins table tbody");
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${adminId}</td>
      <td>${name}</td>
      <td>${email}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editAdmin(this)">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAdmin(this)">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
    adminId++;
  }

  this.reset();
  this.classList.add("d-none");
});

function deleteAdmin(button) {
  if (confirm("Are you sure you want to delete this admin?")) {
    const row = button.closest("tr");
    row.remove();
  }
}

function editAdmin(button) {
  const row = button.closest("tr");
  const name = row.cells[1].textContent;
  const email = row.cells[2].textContent;

  document.getElementById("adminName").value = name;
  document.getElementById("adminEmail").value = email;

  const form = document.getElementById("adminForm");
  form.classList.remove("d-none");

  editAdminMode = true;
  currentEditingAdminRow = row;
  document.getElementById("adminSubmitBtn").textContent = "Update Admin";
}
