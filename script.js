
async function measureRequestTime(requestFunction, ...args) {
    const startTime = Date.now();
    try {
        const result = await requestFunction(...args);
        const duration = Date.now() - startTime;
        return { result, duration, error: null };
    } catch (error) {
        const duration = Date.now() - startTime;
        return { result: null, duration, error: error.message };
    }
}

// Create User
document.getElementById("createUserForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const userId = document.getElementById("userId").value;
    const userName = document.getElementById("userName").value;
    const userEmail = document.getElementById("userEmail").value;
    const restData = { id: parseInt(userId), name: userName, email: userEmail };
    const soapData = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:user="spyne.examples.user">
            <soapenv:Header/>
            <soapenv:Body>
                <user:create_user>
                    <user:user_id>${userId}</user:user_id>
                    <user:name>${userName}</user:name>
                    <user:email>${userEmail}</user:email>
                </user:create_user>
            </soapenv:Body>
        </soapenv:Envelope>
    `;
    const soapResult = await measureRequestTime(sendSoapRequest, soapData);
    const restResult = await measureRequestTime(sendRestRequest, restData, "POST");
    displayResults(soapResult, restResult);
});

// Get User
async function getUser() {
    const userId = document.getElementById("getUserId").value;
    const soapData = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:user="spyne.examples.user">
            <soapenv:Header/>
            <soapenv:Body>
                <user:get_user>
                    <user:user_id>${userId}</user:user_id>
                </user:get_user>
            </soapenv:Body>
        </soapenv:Envelope>
    `;
    const soapResult = await measureRequestTime(sendSoapRequest, soapData);
    const restResult = await measureRequestTime(sendRestRequest, {}, "GET", userId);
    displayResults(soapResult, restResult);
}

// Update User
async function updateUser() {
    const userId = document.getElementById("updateUserId").value;
    const userName = document.getElementById("updateUserName").value;
    const userEmail = document.getElementById("updateUserEmail").value;
    const restData = { name: userName, email: userEmail };
    const soapData = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:user="spyne.examples.user">
            <soapenv:Header/>
            <soapenv:Body>
                <user:update_user>
                    <user:user_id>${userId}</user:user_id>
                    <user:name>${userName}</user:name>
                    <user:email>${userEmail}</user:email>
                </user:update_user>
            </soapenv:Body>
        </soapenv:Envelope>
    `;
    const soapResult = await measureRequestTime(sendSoapRequest, soapData);
    const restResult = await measureRequestTime(sendRestRequest, restData, "PUT", userId);
    displayResults(soapResult, restResult);
}

// Delete User
async function deleteUser() {
    const userId = document.getElementById("deleteUserId").value;
    const soapData = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:user="spyne.examples.user">
            <soapenv:Header/>
            <soapenv:Body>
                <user:delete_user>
                    <user:user_id>${userId}</user:user_id>
                </user:delete_user>
            </soapenv:Body>
        </soapenv:Envelope>
    `;
    const soapResult = await measureRequestTime(sendSoapRequest, soapData);
    const restResult = await measureRequestTime(sendRestRequest, {}, "DELETE", userId);
    displayResults(soapResult, restResult);
}

// Function to display results and timing information
function displayResults(soapResponse, restResponse) {
    document.getElementById("soapResponse").textContent = soapResponse.result || "Error: " + soapResponse.error;
    document.getElementById("restResponse").textContent = JSON.stringify(restResponse.result, null, 2) || "Error: " + restResponse.error;

    // Display response times
    const soapTimeText = soapResponse.duration ? `SOAP Response Time: ${soapResponse.duration} ms` : "SOAP request failed";
    const restTimeText = restResponse.duration ? `REST Response Time: ${restResponse.duration} ms` : "REST request failed";

    document.getElementById("soapTime").textContent = soapTimeText;
    document.getElementById("restTime").textContent = restTimeText;
}

// Function to send SOAP request
async function sendSoapRequest(data) {
    const response = await fetch("http://localhost:5001/", {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: data
    });
    return response.text();
}

// Function to send REST request with method and user_id
async function sendRestRequest(data, method, userId = "") {
    const url = `http://localhost:5002/users${userId ? "/" + userId : ""}`;
    const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: method !== "GET" && method !== "DELETE" ? JSON.stringify(data) : null
    });
    return response.json();
}

