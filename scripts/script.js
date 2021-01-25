window.submitForm = function () {
    const form = document.getElementById("form");
    const d = new FormData(form);

    const values = Array.from(form.querySelectorAll("input[name]"))
        .map((el) => el.getAttribute("name"))
        .filter((value, index, self) => {
            return self.indexOf(value) === index;
        }).reduce((acc, next) => {
           if (!acc[next]) {
               const data = d.getAll(next);
               const val = data.length === 1 ? data.pop() : data;

               acc[next] = val;
           }

           return acc;
        }, {})


    alert("Form sent mock, check console to see form data!");
    console.log("form data", values);
};

function createInput(q) {
    return `
        <div class="question__answers--item">
            <label>
                <input type="text" required name="${q.questionId}" placeholder="My Answer" />
            </label>
        </div>
    `;
}

function createGroup(q, type) {
    return q.answers
        .map((answer) => {
            return `
            <div>
                <label class="question__answers--item">
                    <input type="${type}" name="${
                q.questionId
            }" value="${answer}" ${type === "radio" ? "required" : ""} />
                    <div>
                        ${answer}
                    </div>
                </label>
            </div>
        `;
        })
        .join("");
}

function wrapHeader(question, answersHTML, index) {
    return `
        <div class="question">
             <h1 class="question__header">${index}. ${question.title}</h1>
             ${
                 question.image
                     ? `
                <img src="${question.image}" alt="">
             `
                     : ""
             }
             <div class="question__answers ${
                 question.multiple && question.answers ? "check-validity" : ""
             }">
                 ${answersHTML}
             </div>
        </div>
    `;
}

function createTemplate(data) {
    const { questions, examId } = data;

    return questions
        .map((q, i) => {
            let content;

            if (q.answers) {
                content = q.multiple
                    ? createGroup(q, "checkbox")
                    : createGroup(q, "radio");
            } else {
                content = createInput(q);
            }

            return wrapHeader(q, content, i + 1);
        })
        .join("");
}

function checkboxValidity(form) {
    const checkboxes = form.querySelectorAll("input[type=checkbox]");
    const checkboxLength = checkboxes.length;
    const firstCheckbox = checkboxLength > 0 ? checkboxes[0] : null;

    function init() {
        if (firstCheckbox) {
            for (let i = 0; i < checkboxLength; i++) {
                checkboxes[i].addEventListener("change", checkValidity);
            }

            checkValidity();
        }
    }

    function isChecked() {
        for (let i = 0; i < checkboxLength; i++) {
            if (checkboxes[i].checked) return true;
        }

        return false;
    }

    function checkValidity() {
        const errorMessage = !isChecked()
            ? "At least one checkbox must be selected."
            : "";
        firstCheckbox.setCustomValidity(errorMessage);
    }

    init();
}

window.addEventListener("DOMContentLoaded", async () => {
    const data = await (await fetch("data.json")).json();

    document.getElementById("root").innerHTML = createTemplate(data);

    document.querySelectorAll(".check-validity").forEach(checkboxValidity);

    document
        .getElementById("form")
        .addEventListener("submit", function (event) {
            event.preventDefault();

            window.submitForm();
        });
});
