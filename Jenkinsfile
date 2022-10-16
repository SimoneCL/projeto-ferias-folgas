def getBuildVersion(String version, String branch, String build) {
    return version + "-" + branch.replaceAll("/","-") + "-" + build;
}
 

pipeline {
    agent {
        label 'front-end'
    }
    stages {
        stage('Tests') {
            steps {
                container('node') {
                    sh 'npm install'
                    sh "mkdir -p reports"
                    sh 'npm run-script tslint'
                    sh 'npm run-script checkstyle'
                    sh 'npm run-script test-ci'
                   
                }
            }
        }
        stage('Build') {
            environment {
              BUILDVERSION = getBuildVersion("0.0.0", "${BRANCH_NAME}", "${BUILD_ID}")
            }            
            steps {                
                container('node') {
                    sh 'npm version $BUILDVERSION --no-git-tag-version'
                    sh 'sed -i "s|No_Git_Data|$GIT_BRANCH-$GIT_COMMIT|g" package.json'
                    sh 'npm run-script build'
                    sh 'sed -i "s|No_Git_Data|$GIT_BRANCH-$GIT_COMMIT|g" package.json'
                }
            }
        } 
        stage('Reports') {
            steps {
                recordIssues(
                    enabledForFailure: true,
                    tools: [
                        tsLint(pattern: 'reports/tslint-result.xml')
                    ]
                ) 
                junit 'reports/tu-report.xml'
                publishHTML (target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/geren-ferias-folgas',
                    reportFiles: 'index.html',
                    reportName: "Coverage Report"
                ])
            }
        }
        stage('SonarQube') {
            when {
                branch 'master'
            }
            steps {
                container('node') {
                    script {
                        withSonarQubeEnv('sonarqube') {
                            def scannerHome = tool 'SonarScanner';
                            sh "${scannerHome}/bin/sonar-scanner"
                        }
                    }
                }
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Package') {
            steps {
                container('maven') {
                    dir('ci/war-tomcat') {
                        sh 'mvn clean package -U --batch-mode'
                    }
                }
            }
        }
        stage('Deploy to Central') {
            when {
                branch 'master'
            }
            steps {
                container('maven') {
                    dir('ci/war-tomcat') {
                        sh 'mvn deploy --batch-mode'
                    }
                }
            }
        }
        stage('Archive Artifacts') {
            steps {
                sh 'echo "docker run --rm -it -e BUILD_URL=$BUILD_URL/artifact/ -e SERVER=gales.jv01.local -e PORT=8180 -p 80:80/tcp docker.totvs.io/datasul/devops/qa-nginx-proxy:latest" > testes.txt'
                archiveArtifacts artifacts: 'testes.txt', fingerprint: true
                archiveArtifacts artifacts: 'ci/war-*/target/**/*.war', fingerprint: true
                build(
                    job: '/Teste_Integrado',
                    wait:false,
                    propagate: false,
                    parameters: [
                        string(name: 'JOB', value: "$JOB_NAME"),
                        string(name: 'BUILD', value: "$BUILD_ID"),
                        string(name: 'BUILD_URL', value: "$BUILD_URL")
                    ]
                )
            }
        }
    }
}