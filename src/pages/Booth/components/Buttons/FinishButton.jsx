function FinishButton(props) {
  return (
    <button
      onClick={() => {
        props.action();
      }}
      className="button is-medium question-button proceed-button"
      id="next-button"
    >
      <span>CONTINUAR</span>
      <span className="icon is-small">
        <i className="fas fa-2x fa-caret-right"></i>
      </span>
    </button>
  );
}
export default FinishButton;
