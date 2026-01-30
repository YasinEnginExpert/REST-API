package models

type Device struct {
	ID       string `json:"id"`
	Hostname string `json:"hostname"`
	IP       string `json:"ip"`
	Model    string `json:"model"` // e.g., Cisco 2960, Juniper SRX
	OS       string `json:"os"`    // e.g., Cisco IOS, Junos
}
