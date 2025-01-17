export default function DropFile(props) {
  const checkFile = (text) => {
    try {
      const content = JSON.parse(text);
      return content;
      
    } catch (err) {
      return "";
    }
  };

  const filesToString = (file) => {
    var reader = new FileReader();
    reader.onload = function () {
      let fileContent = reader.result;
      props.setText(checkFile(fileContent));
    };
    reader.readAsText(file);
  };

  const buttonUpload = () => {
    const fileInput = document.getElementById("file-input");
    fileInput.click();
  };
  return (
    <div>
      <div
        id="drop-zone-key"
        className="file-zone d-flex justify-content-center align-content-center"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          filesToString(e.dataTransfer.files[0]);
        }}
        onClick={buttonUpload}
      >
        <div className="d-flex justify-content-center p-1">
          <span>
            Arrastre o haga click aquí para subir el archivo
          </span>
        </div>
      </div>
      <input
        hidden
        id="file-input"
        type="file"
        onChange={(e) => {
          e.preventDefault();
          filesToString(e.target.files[0]);
        }}
      />
    </div>
  );
}
