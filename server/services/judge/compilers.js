const compilers = {
  cpp: {
    image: 'codearena-cpp',
    fileName: 'solution.cpp',
    compileCmd: 'g++ -o /code/solution solution.cpp -std=c++17 -O2',
    runCmd: './solution',
    needsCompilation: true
  },
  python: {
    image: 'codearena-python',
    fileName: 'solution.py',
    compileCmd: null,
    runCmd: 'python3 solution.py',
    needsCompilation: false
  },
  java: {
    image: 'codearena-java',
    fileName: 'Main.java',
    compileCmd: 'javac -d /code Main.java',
    runCmd: 'java -cp /code Main',
    needsCompilation: true
  }
};

module.exports = compilers;
