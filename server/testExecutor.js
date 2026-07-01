const DockerExecutor = require('./services/judge/DockerExecutor');

const testCases = [
  { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false },
  { input: '3\n3 2 4\n6', output: '1 2', isHidden: true }
];

const cppCode = `
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for(int i=0; i<n; i++) cin >> nums[i];
    int target;
    cin >> target;
    
    for(int i=0; i<n; i++){
        for(int j=i+1; j<n; j++){
            if(nums[i] + nums[j] == target){
                cout << i << " " << j << "\\n";
                return 0;
            }
        }
    }
    return 0;
}
`;

const pythonCode = `
import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[-1])
    
    for i in range(n):
        for j in range(i+1, n):
            if nums[i] + nums[j] == target:
                print(f"{i} {j}")
                return

if __name__ == '__main__':
    main()
`;

async function runTests() {
  console.log("=== Testing C++ Execution ===");
  const cppResult = await DockerExecutor.execute(cppCode, 'cpp', testCases);
  console.log(JSON.stringify(cppResult, null, 2));

  console.log("\\n=== Testing Python Execution ===");
  const pyResult = await DockerExecutor.execute(pythonCode, 'python', testCases);
  console.log(JSON.stringify(pyResult, null, 2));
}

runTests().catch(console.error);
