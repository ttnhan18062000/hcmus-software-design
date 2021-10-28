$(document).ready(function () {
  $(".data-user-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "20%" },
        { "width": "25%" },
        { orderable: false,"width": "30%" },
        { "width": "15%" },
        { orderable: false,"width": "5%" }
      ]
      
    });

  });
  $(".data-writer-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "20%" },
        { "width": "25%" },
        { "width": "15%" },
        { orderable: false,"width": "30%" },
        { orderable: false,"width": "5%" }
      ]
      
    });

  });
  $(".data-editor-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "20%" },
        { "width": "30%" },
        { orderable: false,"width": "30%" },
        { orderable: false,"width": "10%" },
        { orderable: false,"width": "5%" }
      ]
      
    });

  });
  $(".data-assignedCat-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "10%" },
        { orderable: false,"width": "45%" },
        { "width": "45%" },
      ]
      
    });

  });
  $(".data-admin-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "25%" },
        { "width": "30%" },
        { orderable: false,"width": "35%" },
        { orderable: false,"width": "5%" }
      ]
      
    });

  });
  $(".data-tag-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "90%" },
        { orderable: false,"width": "5%" }
      ]
      
    });

  });

  $(".data-post-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "47%" },
        { "width": "23%" },
        { "width": "20%" },
        { orderable: false,"width": "5%" },                
      ]
      
    });

  });
  $(".data-writerPostEdit-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "60%" },
        { "width": "30%" },       
        { orderable: false,"width": "5%" },                
      ]
      
    });

  });
  $(".data-writerPostRejected-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "50%" },
        { "width": "30%" },
        { orderable: false,"width": "5%" },                
        {orderable: false,"width": "10%" },       
      ]
      
    });

  });
  $(".data-writerPost-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "47%" },
        { "width": "23%" },       
        { "width": "25%" },                
      ]
      
    });

  });
  $(".data-editorPostList-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "45%" },
        { "width": "25%" },       
        { "width": "20%" },       
        { orderable: false,"width": "5%" },                
      ]
      
    });

  });
  $(".data-editorApprovedList-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "3%" },
        { "width": "38%" },
        { "width": "25%" },       
        { "width": "20%" },               
        { "width": "14%" },               
      ]
      
    });

  });
  $(".data-pending-table").each(function (_, table) {
    $(table).DataTable({
      "columns": [
        { "width": "5%" },
        { "width": "26%" },
        { orderable: false,"width": "35%" },
        { "width": "23%" },
        { orderable: false,"width": "11%" }
      ]
      
    });

  });
});


