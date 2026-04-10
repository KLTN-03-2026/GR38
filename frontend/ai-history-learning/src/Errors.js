function Errors(props) {
    const { errors } = props;

    return (
        <div className="error-container">
            {Object.keys(errors).map((key, index) => (
                <div key={index} className="error-item">
                     {errors[key]}
                </div>
            ))}
        </div>
    );
}
export default Errors;