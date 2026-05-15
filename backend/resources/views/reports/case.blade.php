<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Case Report - {{ $case->case_number }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #333; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; text-transform: uppercase; letter-spacing: 2px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; background: #f0f0f0; padding: 5px 10px; margin-bottom: 15px; text-transform: uppercase; font-size: 14px; border-left: 4px solid #333; }
        .grid { display: table; width: 100%; border-collapse: collapse; }
        .grid-row { display: table-row; }
        .grid-cell { display: table-cell; padding: 8px; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; width: 30%; color: #666; }
        .value { width: 70%; }
        .timeline { list-style: none; padding-left: 20px; }
        .timeline-item { position: relative; padding-bottom: 15px; border-left: 1px solid #ccc; padding-left: 20px; }
        .timeline-item:before { content: ''; position: absolute; left: -5px; top: 0; width: 10px; height: 10px; background: #333; border-radius: 50%; }
        .footer { text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <p style="margin: 0; font-weight: bold;">GOVERNMENT OF INDIA</p>
        <p style="margin: 0; font-size: 10px;">JUDICIAL PORTAL SYSTEM</p>
        <h1>OFFICIAL CASE RECORD</h1>
    </div>

    <div class="section">
        <div class="section-title">Case Identification</div>
        <div class="grid">
            <div class="grid-row">
                <div class="grid-cell label">Case Number:</div>
                <div class="grid-cell value">{{ $case->case_number }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Title:</div>
                <div class="grid-cell value">{{ $case->title }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Type:</div>
                <div class="grid-cell value">{{ strtoupper($case->case_type) }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Current Status:</div>
                <div class="grid-cell value">{{ strtoupper(str_replace('_', ' ', $case->status)) }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Primary Parties & Assignment</div>
        <div class="grid">
            <div class="grid-row">
                <div class="grid-cell label">Client / Litigant:</div>
                <div class="grid-cell value">{{ $case->client->name }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Assigned Judge:</div>
                <div class="grid-cell value">{{ $case->judge->name ?? 'NOT ASSIGNED' }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Legal Representative:</div>
                <div class="grid-cell value">{{ $case->lawyer->name ?? 'NOT ASSIGNED' }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Filing Date:</div>
                <div class="grid-cell value">{{ $case->filing_date->format('d M Y') }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Case Description</div>
        <div style="padding: 10px; background: #fafafa; border: 1px solid #eee;">
            {{ $case->description }}
        </div>
    </div>

    @if($case->hearings->count() > 0)
    <div class="section">
        <div class="section-title">Hearing History</div>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f0f0f0;">
                    <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Number</th>
                    <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Date</th>
                    <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($case->hearings as $hearing)
                <tr>
                    <td style="padding: 8px; border: 1px solid #eee;">{{ $hearing->hearing_number }}</td>
                    <td style="padding: 8px; border: 1px solid #eee;">{{ $hearing->hearing_date->format('d M Y') }}</td>
                    <td style="padding: 8px; border: 1px solid #eee;">{{ strtoupper($hearing->status) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="footer">
        <p>This is a computer-generated document from the Judicial Portal System.</p>
        <p>Generated on {{ date('d M Y, h:i A') }}</p>
    </div>
</body>
</html>
