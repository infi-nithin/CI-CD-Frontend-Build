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
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'build/**'
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
