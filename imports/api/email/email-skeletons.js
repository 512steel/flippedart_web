export var TRANSACTIONAL_EMAIL_SHELL = {
    "categories": [
        "",
    ],
    "content": [
        {
            "type": "text/html",
            "value": "Empty value"
        }
    ],
    "from": {
        "email": "hello@flippedart.org",
        "name": "Flipped Art"
    },
    "personalizations": [
        {
            "substitutions": {
                "substitution_tag":"",
                "substitution_tag_2":""
            },
            "to": [
                {
                    "email": "",
                    "name": ""
                }
            ]
        }
    ],
    "reply_to": {
        "email": "hello@flippedart.org",
        "name": "Flipped Art"
    },
    "subject": "Subject line",
    "template_id": "7307ccc4-a140-4dc7-823b-778794df9134",
    "tracking_settings": {
        "click_tracking": {
            "enable": true,
            "enable_text": true
        },
        "open_tracking": {
            "enable": true,
            "substitution_tag": "%opentrack"
        },
        "subscription_tracking": {
            "enable": true,
            "html": "If you would like to unsubscribe and stop receiving these emails <%click here%>.",
            "substitution_tag": "<%click here%>",
            "text": "If you would like to unsubscribe and stop receiveing these emails <%click here%>."
        }
    }
};