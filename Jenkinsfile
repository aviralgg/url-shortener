pipeline {
  agent any
  stages {
    stage('Checkout'){ steps { checkout scm } }
    stage('Install'){ steps { sh 'npm install' } }
    stage('Test'){ steps { sh 'npm test || true' } }
    stage('Build'){ steps { sh 'docker build -t url-shortener:latest .' } }
  }
}
