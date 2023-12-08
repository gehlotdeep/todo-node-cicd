pipeline {
    agent any
    
    stages {
        
        stage("code"){
            steps{
                git url: "https://github.com/gehlotdeep/todo-node-cicd.git", branch: "master"
                echo 'cloning the code'
            }
        }
        stage("build and test"){
            steps{
                sh "docker build -t todo-node-cicd ."
                echo 'Building the code'
            }
        }
        stage("scan image"){
            steps{
                echo 'image scanning'
            }
        }
        stage("push"){
            steps{
                withCredentials([usernamePassword(credentialsId:"dockerhub",passwordVariable:"dockerhubPass",usernameVariable:"dockerhubUser")]){
                sh "docker login -u ${env.dockerhubUser} -p ${env.dockerhubPass}"
                sh "docker tag todo-node-cicd:latest ${env.dockerhubUser}/todo-node-cicd:latest"
                sh "docker push ${env.dockerhubUser}/todo-node-cicd:latest"
                echo 'Image push to docker Hub'
                }
            }
        }
        stage("deploy"){
            steps{
                sh "docker-compose down && docker-compose up -d"
                echo 'Deployment face'
            }
        }
    }
}
