pipeline {

  agent any

  environment {
    DEPLOY_HOST = "172.31.4.222"
    DEPLOY_USER = "ubuntu"
  }

  stages {

    stage('Checkout'){ 
      steps { 
        checkout scm 
      } 
    }

    stage('Install'){ 
      steps { 
        sh 'npm ci'
      }
    }

    stage('Test'){ 
      steps { 
        sh 'npm test || true'
      } 
    }

    stage('Build'){ 
      steps { 
        sh 'docker build -t url-shortener:latest .' 
      } 
    }
    
    stage('Deploy') {
      steps {
        sshagent(credentials: ['ec2-ssh-key']) {
          sh """
            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "./deploy.sh"
          """
        }
      }
    }

  }

  post {

    success {
      echo 'Deployment Successful'
    }

    failure {
      echo 'Pipeline Failed'
    }

    always {
      cleanWs()
    }
  }

}
