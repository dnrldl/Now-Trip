package com.nowtrip.api.response.ppp;

import lombok.Data;

@Data
public class Meta {
    private int page;
    private int pages;
    private String per_page;
    private int total;
}
