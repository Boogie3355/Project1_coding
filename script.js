class CareerPlatform {
    constructor() {
        this.currentSection = 'home';
        this.assessmentData = [];
        this.userResponses = {};
        this.currentQuestionIndex = 0;
        this.practiceProblems = [];
        
        this.initializeEventListeners();
        this.loadAssessmentQuestions();
        this.loadPracticeProblems();
    }

    initializeEventListeners() {
        document.getElementById('startAssessment').addEventListener('click', () => {
            this.showSection('assessment');
            this.updateProgressBar();
        });

        document.getElementById('submitAssessment').addEventListener('click', () => {
            this.processAssessment();
        });

        // Navigation links with smooth transitions
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('a').getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Filter listeners
        ['industryFilter', 'experienceFilter'].forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.filterJobs());
            }
        });

        // Add filter listeners for practice problems
        ['difficultyFilter', 'categoryFilter'].forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.renderPracticeProblems());
            }
        });
    }

    updateProgressBar() {
        const progress = ((this.currentQuestionIndex + 1) / this.assessmentData.length) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
    }

    async loadAssessmentQuestions() {
        try {
            const response = await fetch('assessment-questions.json');
            const data = await response.json();
            this.assessmentData = data.questions;
            this.renderCurrentQuestion();
        } catch (error) {
            console.error('Error loading assessment questions:', error);
            this.showError('Failed to load questions. Please try again later.');
        }
    }

    renderCurrentQuestion() {
        const container = document.getElementById('questionContainer');
        const question = this.assessmentData[this.currentQuestionIndex];
        
        if (!question) return;

        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.innerHTML = `
            <h3>${question.question}</h3>
            <div class="options">
                ${question.options.map(option => `
                    <div class="option" data-value="${option}">
                        <input type="radio" name="q${this.currentQuestionIndex}" 
                               value="${option}" 
                               id="q${this.currentQuestionIndex}${option}">
                        <label for="q${this.currentQuestionIndex}${option}">${option}</label>
                    </div>
                `).join('')}
            </div>
            <div class="question-navigation">
                ${this.currentQuestionIndex > 0 ? 
                    `<button class="prev-btn">Previous</button>` : ''}
                ${this.currentQuestionIndex < this.assessmentData.length - 1 ? 
                    `<button class="next-btn">Next</button>` : 
                    `<button class="submit-btn">Submit</button>`}
            </div>
        `;

        container.innerHTML = '';
        container.appendChild(questionCard);

        // Add click handlers for options
        questionCard.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => {
                option.querySelector('input').checked = true;
                this.userResponses[this.currentQuestionIndex] = option.dataset.value;
            });
        });

        // Navigation button handlers
        const prevBtn = questionCard.querySelector('.prev-btn');
        const nextBtn = questionCard.querySelector('.next-btn');
        const submitBtn = questionCard.querySelector('.submit-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateQuestion(-1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateQuestion(1));
        }
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.processAssessment());
        }

        this.updateProgressBar();
    }

    navigateQuestion(direction) {
        this.currentQuestionIndex += direction;
        this.renderCurrentQuestion();
    }

    async processAssessment() {
        try {
            const response = await fetch('/api/process-assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.userResponses)
            });

            const results = await response.json();
            this.displayResults(results);
            this.showSection('jobs');
        } catch (error) {
            console.error('Error processing assessment:', error);
            this.showError('Failed to process assessment. Please try again.');
        }
    }

    displayResults(results) {
        const jobsContainer = document.getElementById('jobsContainer');
        jobsContainer.innerHTML = '';

        results.jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.innerHTML = `
                <h3>${job.title}</h3>
                <div class="match-score">
                    <i class="fas fa-chart-line"></i> ${job.matchScore}% Match
                </div>
                <p>${job.description}</p>
                <div class="job-actions">
                    <button onclick="window.location.href='${job.applyLink}'">
                        <i class="fas fa-external-link-alt"></i> Learn More
                    </button>
                    <button class="save-job">
                        <i class="far fa-bookmark"></i> Save
                    </button>
                </div>
            `;
            jobsContainer.appendChild(jobCard);
        });

        const learningContainer = document.getElementById('learningContainer');
        learningContainer.innerHTML = `
            <div class="skills-section">
                <h3>Recommended Skills</h3>
                <div class="skills-grid">
                    ${results.skills.map(skill => `
                        <div class="skill-card">
                            <h4>${skill.name}</h4>
                            <p>${skill.description}</p>
                            <button class="start-learning">Start Learning</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showSection(sectionId) {
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');
        this.currentSection = sectionId;

        // Render practice problems when switching to practice section
        if (sectionId === 'practice') {
            this.renderPracticeProblems();
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }

    filterJobs() {
        // Implement job filtering logic
        const industry = document.getElementById('industryFilter').value;
        const experience = document.getElementById('experienceFilter').value;
        // Filter jobs based on selected values
    }

    async loadPracticeProblems() {
        try {
            console.log('Loading practice problems...');
            const response = await fetch('assessment-questions.json');
            console.log('Response received:', response);
            const data = await response.json();
            console.log('Data parsed:', data);
            this.practiceProblems = data.practiceProblems;
            if (this.currentSection === 'practice') {
                this.renderPracticeProblems();
            }
        } catch (error) {
            console.error('Error loading practice problems:', error);
            this.showError('Failed to load practice problems');
        }
    }

    renderPracticeProblems() {
        const container = document.getElementById('problemsContainer');
        container.innerHTML = '';

        const difficulty = document.getElementById('difficultyFilter')?.value;
        const category = document.getElementById('categoryFilter')?.value;

        let filteredProblems = this.practiceProblems;
        if (difficulty) {
            filteredProblems = filteredProblems.filter(p => p.difficulty === difficulty);
        }
        if (category) {
            filteredProblems = filteredProblems.filter(p => p.category === category);
        }

        filteredProblems.forEach(problem => {
            const problemCard = document.createElement('div');
            problemCard.className = 'problem-card';
            problemCard.innerHTML = `
                <div class="problem-header">
                    <h3 class="problem-title">${problem.title}</h3>
                    <span class="problem-difficulty difficulty-${problem.difficulty.toLowerCase()}">
                        ${problem.difficulty}
                    </span>
                </div>
                <span class="problem-category">${problem.category}</span>
                <p class="problem-description">${problem.description}</p>
                ${problem.examples.map(example => `
                    <div class="problem-example">
                        <div>Input: ${example.input}</div>
                        <div>Output: ${example.output}</div>
                    </div>
                `).join('')}
                <button onclick="platform.openProblem('${problem.id}')">
                    <i class="fas fa-code"></i> Solve Problem
                </button>
            `;
            container.appendChild(problemCard);
        });
    }

    openProblem(problemId) {
        const problem = this.practiceProblems.find(p => p.id === problemId);
        if (!problem) return;
        
        this.currentProblemId = problemId;
        
        const modal = document.getElementById('problem-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalExamples = document.getElementById('modal-examples');
        const codeEditor = document.getElementById('code-editor');

        modalTitle.textContent = problem.title;
        modalDescription.innerHTML = `
            <div class="problem-difficulty difficulty-${problem.difficulty.toLowerCase()}">
                ${problem.difficulty}
            </div>
            <div class="problem-category">${problem.category}</div>
            <p>${problem.description}</p>
        `;

        modalExamples.innerHTML = problem.examples.map(example => `
            <div class="problem-example">
                <div><strong>Input:</strong> ${example.input}</div>
                <div><strong>Output:</strong> ${example.output}</div>
            </div>
        `).join('');

        // Set default code template based on selected language
        const language = document.getElementById('language-select').value;
        codeEditor.value = this.getCodeTemplate(language);

        modal.classList.remove('hidden');

        // Add event listeners
        document.querySelector('.close-modal').onclick = () => {
            modal.classList.add('hidden');
        };

        document.getElementById('run-code').onclick = () => {
            this.runCode();
        };

        document.getElementById('submit-solution').onclick = () => {
            this.submitSolution(problem.id);
        };

        document.getElementById('language-select').onchange = (e) => {
            codeEditor.value = this.getCodeTemplate(e.target.value);
        };
    }

    getCodeTemplate(language) {
        const templates = {
            javascript: `function solve(input) {
    const [nums, target] = input;
    // Write your code here
    return [];
}`,
            python: `def solve(input):
    nums, target = input
    # Write your code here
    return []`,
            java: `// Write your code here
// Arrays are available as 'nums' and 'target'
return new int[]{0, 1};`,
            cpp: `// Write your code here
// Arrays are available as 'nums' and 'target'
return {0, 1};`
        };
        return templates[language] || templates.javascript;
    }

    runCode() {
        const output = document.getElementById('output-area');
        const codeOutput = document.getElementById('code-output');
        const code = document.getElementById('code-editor').value;
        
        output.classList.remove('hidden');
        
        try {
            const result = this.executeJavaScript(code);
            codeOutput.textContent = result;
        } catch (error) {
            codeOutput.textContent = '❌ Error: ' + error.message;
        }
    }

    executeJavaScript(code) {
        try {
            const testCase = this.getCurrentProblemTestCases()[0];
            
            // Create a safe execution context
            const runTest = (input) => {
                // Create a function from user's code and run it
                const fn = new Function('input', `
                    ${code}
                    return solve(input);
                `);
                return fn(input);
            };

            // Run the test case
            const result = runTest(testCase.input);
            const expected = JSON.parse(testCase.output);

            // Compare arrays
            const isEqual = JSON.stringify(result) === JSON.stringify(expected);

            if (isEqual) {
                return '✅ Correct!';
            } else {
                return `❌ Wrong Answer
Input: ${JSON.stringify(testCase.input)}
Your Output: ${JSON.stringify(result)}
Expected: ${JSON.stringify(expected)}`;
            }

        } catch (error) {
            return `❌ Error: ${error.message}
Check your code syntax and make sure you have a solve function that takes an input parameter.`;
        }
    }

    getCurrentProblemTestCases() {
        // Get the current problem's test cases
        const problemId = this.currentProblemId;
        const problem = this.practiceProblems.find(p => p.id === problemId);
        
        if (!problem) return [];

        // Return both visible examples and hidden test cases
        return [
            ...problem.examples,
            ...(problem.testCases || [])
        ];
    }

    submitSolution(problemId) {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        // For now, just show an alert
        alert('Solution submitted successfully!\nThis is a mock implementation.');
    }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    window.platform = new CareerPlatform();
}); 