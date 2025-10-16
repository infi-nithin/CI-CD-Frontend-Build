pipeline {
    agent any
    tools {
        nodejs 'Node22' 
    }
    stages {
        stage('Clean') {
          steps{
            cleanWs()
          }
        }
        stage('Checkout') {
            steps {
                sh 'git clone https://github.com/infi-nithin/CI-CD-Frontend-Build.git'
            }
        }

        stage('Install Dependencies') {
            steps {
				dir('CI-CD-Frontend-Build'){
					sh 'npm install'
				}
            }
        }

        stage('Build') {
            steps {
				dir('CI-CD-Frontend-Build'){
					sh 'npm run build'
				}
            }
        }

        stage('Archive Artifacts') {
            steps {
				dir('CI-CD-Frontend-Build'){
					archiveArtifacts artifacts: ''dist/**''
				}
            }
        }

    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
