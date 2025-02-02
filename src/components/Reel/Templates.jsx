import '../../assets/css/template.css'

export const TemplateSelector = ({selectedTemplate, setTemplate}) =>{
    return (
        <div>
            <div className="template-container">
                <h1>Select Templates </h1>
                <div className="select-container">

                    <select
                        value={selectedTemplate}
                        onChange={(e) => setTemplate(e.target.value)}
                    > 
                        <option value="slide">slide</option>
                        <option value="fade">Fade</option>
                        <option value="zoom">Zoom</option>
                    </select>
                </div>

            </div>
        </div>
    );
}